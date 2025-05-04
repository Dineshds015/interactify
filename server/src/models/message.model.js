import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
},
    { timestamps: true }
);

messageSchema.pre("save", function (next) {
    if (!this.receiverId && !this.groupId) {
        return next(new Error("Message must have either receiverId or groupId"));
    }
    next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;