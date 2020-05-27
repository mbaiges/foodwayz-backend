module.exports = {
    message: class Message {
        static response(type, msg, res) {
            return {
                message: `Successfully ${type} ${msg}`,
                result: res
            };
        }

        static fetch(msg, res) {
            return Message.response('fetched', msg, res);
        }

        static put(msg, res) {
            return Message.response('modified', msg, res);
        }

        static delete(msg, res) {
            return Message.response('deleted', msg, res);
        }
    }
}