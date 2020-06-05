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
                description: [
                    {
                        params: params
                    }
                ]
            }
        }

        static conflict(type, reason, conflicting_obj) {
            return {
                message: `Conflict with ${type}`,
                description: [
                    {
                        reason: reason,
                        conflicting_obj: conflicting_obj
                    }
                ]
            }
        }

        static unauth(action, description) {
            return {
                message: `Unauthorize ${action}`,
                description: [
                    description
                ]
            }
        }

        static fetch(msg, res) {
            return Message.response('fetched', msg, res);
        }

        static post(msg, res) {
            return Message.response('added', msg, res);
        }

        static put(msg, res) {
            return Message.response('modified', msg, res);
        }

        static delete(msg, res) {
            return Message.response('deleted', msg, res);
        }
    }
}