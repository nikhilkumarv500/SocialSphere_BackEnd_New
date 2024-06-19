const express = require("express");
const router = new express.Router();
const userControllers = require("../Controllers/UserController");
const postControllers = require("../Controllers/PostController");
const upload = require("../multerConfig/StorageConfig");

//Routes for User
router.post("/user/register", upload.single("profile_image") ,userControllers.userpost);

router.get('/user/getAllUsers',userControllers.getAllUsers);

router.get('/user/getSingleUser/:emailParam',userControllers.getSingleUser);

router.put('/user/edit/:emailParam',upload.single("profile_image"),userControllers.editUserData);

router.delete('/user/delete/:emailParam',userControllers.deleteUser);

router.post('/user/login',userControllers.loginUser);

router.post('/user/followers',userControllers.getFollowersCount);

router.delete('/user/delete/allUsersCollection',userControllers.allUsersCollection);

router.delete('/user/delete/allUserPasswordCollection',userControllers.allUserPasswordCollection);

//Routs for Image Posts
router.post('/post/create',postControllers.userpost);

router.put('/post/update',postControllers.userPostUpdate);

router.post('/post/update/likesAndComments',postControllers.postLikesAndCommentsUpdate);

router.get('/post/getAllPosts',postControllers.getAllPosts);

router.get('/post/getPostsByEmail/:emailParam',postControllers.getPostsByEmail);

router.delete('/post/delete/:id',postControllers.deletePostById);

router.delete('/post/delete/:emailParam', postControllers.deletePostByEmail);

router.delete('/post/delete/allPost', postControllers.deleteAllPosts);

//Routes for get access to uploadFolderImages

router.post('/getAll/images/from/uploadFolder',postControllers.getAllImageFileNamesFromUpload);

router.post('/delete/image/from/uploadFolderUsingName', postControllers.deleteImageByFileNameFromUpload);

module.exports = router;