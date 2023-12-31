const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser } = require('./utils');

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next()
});

postsRouter.get('/', async (req, res) => {
  try {
    const allPosts = await getAllPosts()

    const posts = allPosts.filter(post => {
      return post.active || (req.user && post.author.id === req.user.id);
    })

    res.send({
      posts
    })
  } catch ({ name, message }) {
    next({ name, message })
  }
})

postsRouter.post('/', requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/)
  const postData = {
    authorId: req.user.id,
    title,
    content
  };

  // only send the tags if there are some to send
  if (tagArr.length) {
    postData.tags = tagArr;
  }

  try {
    // add authorId, title, content to postData object
    const post = await createPost(postData);
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object 
    if (post) {
      res.send({ post });
    }
    else {
      next({ name: 'Error', message: 'Failed to create post.' })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }

  if (title) {
    updateFields.title = title;
  }

  if (content) {
    updateFields.content = content;
  }

  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatedPost = await updatePost(postId, updateFields);
      res.send({ post: updatedPost })
    } else {
      next({
        name: 'UnauthorizedUserError',
        message: 'You cannot update a post that is not yours'
      })
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);

    // if (post && post.author.id === req.user.id) {
    //   const updatedPost = await updatePost(post.id, { active: false });

    //   res.send({ post: updatedPost });
    // } else {
    //   // if there was a post, throw UnauthorizedUserError, 
    //   // otherwise throw PostNotFoundError
    //   next(post ? {
    //     name: "UnauthorizedUserError",
    //     message: "You cannot delete a post which is not yours"
    //   } : {
    //     name: "PostNotFoundError",
    //     message: "That post does not exist"
    //   });
    // }

    // wrote these conditionals differently because the PostNotFoundError wasn't working.
    // every time i sent a request to delete a post that was already deactivated it would send
    // the deactivated post back. which let me know the delete request was working, but it wasn't recognizing
    // that a post was already deactivated.

    // if there is an active post and the id of the user making the request matches the author
    // id of the post, change the active status to false and send the updated post back
    if (post.active && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false })

      res.send({ post: updatedPost })
      // else if the post is active and the author id does NOT match the id of the user making the 
      // request, send UnauthorizedUserError
    } else if (post.active && post.author.id !== req.user.id) {
      next({
        name: "UnauthorizedUserError",
        message: "You cannot delete a post which is not yours."
      })
      // if there is no active post, send PostNotFoundError
    } else {
      next({
        name: 'PostNotFoundError',
        message: "That post does not exist."
      })
    }
  } catch ({ name, message }) {
    next({ name, message })
  }
});

module.exports = postsRouter;