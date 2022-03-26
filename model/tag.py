import os, sys
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ["CUDA_VISIBLE_DEVICES"] = '0'
import tensorflow as tf

# =========================== #
# = Copyright (c) TheShad0w = #
# =========================== #

tf.compat.v1.disable_eager_execution()

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

candidate = sys.argv[1]
stream = tf.io.gfile.GFile(candidate, 'rb').read()
prenex = [l.rstrip() for l in tf.io.gfile.GFile(os.path.join(__location__, "retrained_labels.txt"))]

# The retrained_graph.pb file is a frozen graph (SavedModel).
# It was created using transfer learning with an Inception v3 architecture model
# which displays summaries in TensorBoard. The top layer receives a 2048-dimensional 
# vector for each image as input. A softmax layer was trained on top of this
# representation. Assuming the softmax layer contains N labels, this corresponds
# to learning N + 2048*N model parameters corresponding to the learned biases and weights.
# Inception v3 also creates "bottlenecks" (a neural-network layer with fewer neurons than the 
# layer below / above) to reduce the number of feature maps (aka channels) in the network, 
# which, otherwise, tend to increase in each layer. This is achieved by using 1x1 convolutions 
# with fewer output channels than input channels.

with tf.io.gfile.GFile(os.path.join(__location__, "retrained_graph.pb"), 'rb') as f:
    graph_def = tf.compat.v1.GraphDef()
    graph_def.ParseFromString(f.read())
    tf.import_graph_def(graph_def, name='')

with tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(device_count={'GPU': 0})) as instance:
    softmax_tensor = instance.graph.get_tensor_by_name('final_result:0')
    predictions = instance.run(softmax_tensor, { 'DecodeJpeg/contents:0': stream })
    sorted_prediction = predictions[0].argsort()[::-1]
    parsed_data = ", ".join(['"{hs:s}": {score:.5f}'.format(hs=prenex[node], score=predictions[0][node]) for node in sorted_prediction])
    print("{ " + parsed_data + " }")
