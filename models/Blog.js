const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema ({
    title:{
        type: String,
        required : true
    },

    author:{
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User',
       required: true
    },

    datePosted:{
        type: Date,
        default: Date.now,
        required: true
    },

    blogImage:{
        type: String
    },

    blogText:{
        type: String,
        required:true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    dislikes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;
