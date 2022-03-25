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
