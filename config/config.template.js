export default {
    server: {
        port: 1337,
        dev_mode: false,
        base_url: "/spenden",
    },
    auth: {
        secret: "",
    },
    result_server: {
        uri: "https://api.spendenraid.rundesballi.com/editPost.php",
        image_getter: "https://api.spendenraid.rundesballi.com/getJPG.php",
        secret: "",
    },
};
