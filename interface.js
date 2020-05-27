module.exports = {
    message: class Message {
        static response(type, msg, res) {
            return {
                message: `Successfully ${type} ${msg}`,
                result: res
            };
        }

        static notFound(type, id) {
            return {
                message: `Unable to find ${type} with id ${id}`
            }
        }

        static badRequest(type, id, params) {
            return {
                message: `Bad request at ${type} with id ${id}`,
                params: params.filter(p => !p)
            }
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