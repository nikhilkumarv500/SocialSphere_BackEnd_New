const posts = require("../models/PostSchema");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
const { fireBaseStorage } = require("../Firebase/FirebaseConfig");
const { ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } = require("firebase/storage");
const defaultImageUrl="https://firebasestorage.googleapis.com/v0/b/socialmedia-9ef86.appspot.com/o/images%2FgeneralPost.jpeg_1718819866117.jpeg?alt=media&token=11b52adc-41f2-4b59-8fc6-5d01c5a69907";

const saveBase64Image = async (base64String, fileName) => {
  const matches = await base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const ext = matches[1].split("/")[1];
  const data = matches[2];
  const buffer = await Buffer.from(data, "base64");

  const blob = new Blob([buffer], { type: `image/${ext}` });

  const imgRef = ref(fireBaseStorage, `images/${fileName}.${ext}`);

  try {
    const snapshot = await uploadBytes(imgRef, blob);

    const url = await getDownloadURL(imgRef);  

    return {imageName: `${fileName}.${ext}`, imageUrl: url};

  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error("Error uploading file to Firebase Storage");
  }
};

exports.userpost = async (req, res) => {
      
    const { userName, email, profile_image, post_image, originalFileName, post_name,description, likes, comments } = req.body;
  
    const imageData = (originalFileName ? await saveBase64Image(
        post_image,
      `${originalFileName || "image"}_${Date.now()}`
    ): null);
  
  
    if (!userName || !email  || !profile_image || !post_name  || !likes || !comments) {
      res.status(401).json({errorMsg: "Few missing fields in new post create api payload"});
      return;
    }
  
    try {

        const postData = new posts({
          userName,
          email,
          profile_image,
          post_image: imageData?.imageName || "generalPost.jpeg",
          post_image_url: imageData?.imageUrl || defaultImageUrl,
          post_name,
          description : description || "Hurray, my new post",
          likes,
          comments,
          dateCreated: Date.now(),
        });
        await postData.save();
    
        res.status(200).json(postData);
      
    } catch (e) {
      res.status(401).json({errorMsg: "Post Upload error"});
      console.log(e);
    }
};

exports.userPostUpdate = async (req, res) => {

    const { id, userName, email, profile_image, post_image, originalFileName, post_name,description, likes, comments } = req.body;

    let imageData = {};

    const oldPost = await posts.findById(id);
    if (!oldPost) {
      return res.status(404).json({ errorMsg: "Post not found" });
    }

    if(oldPost.post_image && originalFileName) {
      const imgRef = ref(fireBaseStorage, `images/${oldPost.post_image}`);

      try {
        await getMetadata(imgRef);
        try {
          await deleteObject(imgRef);
          console.log('File deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting file:', deleteError);
          throw new Error("Error deleting file from Firebase Storage");
        }
      } catch (metadataError) {
        if (metadataError.code === 'storage/object-not-found') {
          console.log('File does not exist, no need to delete');
        } else {
          console.error('Error getting file metadata:', metadataError);
          throw new Error("Error checking file existence in Firebase Storage");
        }
      }
    }

    imageData = (originalFileName ? await saveBase64Image(
        post_image,
      `${originalFileName || "image"}_${Date.now()}`
    ): null);

    if (!userName || !email  || !profile_image  || !post_name || !description ) {
        res.status(401).json({errorMsg: "Few missing fields in post update api payload"});
        return;
    }

      try {

        const updatePost = await posts.findOneAndUpdate({ _id: id },
        {
            userName: userName || oldPost.userName,
            email: email || oldPost.email,
            profile_image: profile_image || oldPost.oldPost,
            post_image: imageData?.imageName || oldPost.post_image,
            post_image_url: imageData?.imageUrl || oldPost.post_image_url || defaultImageUrl,
            post_name: post_name || oldPost.post_name,
            description: description || oldPost.description,
            likes: likes || oldPost.likes,
            comments: comments || oldPost.comments,
            dateCreated: oldPost.dateCreated || Date.now(),
        },
        {
            new: true,
        }
        );

        await updatePost.save();

        res.status(200).json(updatePost);
    
      
    } catch (e) {
      res.status(401).json({errorMsg: "Update Post api error"});
      console.log(e);
    }


};

exports.postLikesAndCommentsUpdate = async (req, res) => {

    const { id, likes, comments} = req.body;

    if ( !id || (!likes && !comments)) {
        res.status(401).json({errorMsg: "Few missing fields in post like and comment update api payload"});
        return;
    }

    try {

        const oldPost = await posts.findOne({ _id: id });

        const updatePost = await posts.findOneAndUpdate({ _id: id },
        {
            userName: oldPost.userName,
            email:oldPost.email,
            profile_image:oldPost.oldPost,
            post_image: oldPost.post_image,
            post_name:oldPost.post_name,
            description: oldPost.description,
            likes: likes || oldPost.likes,
            comments: comments || oldPost.comments,
        },
        {
            new: true,
        }
        );

        await updatePost.save();

        res.status(200).json(updatePost);
    
    } catch (e) {
      res.status(401).json({errorMsg: "Update Post api error"});
      console.log(e);
    }



}

exports.getAllPosts = async (req, res) => {
    try {
        const allPosts = await posts.find();
        res.status(200).json(allPosts);
      } catch (e) {
        console.log(e)
        res.status(401).json({errorMsg: "Could'nt fetch all posts"});
      }
}

exports.getPostsByEmail = async (req, res) => {

    try {
        const { emailParam } = req.params;
        const postsResult = await posts.find({ email: emailParam });
        res.status(200).json(postsResult);
      } catch (e) {
        console.log(e)
        res.status(401).json({errorMsg: "error in fetch posts related to specific user"});
      }

}

exports.deletePostById = async (req, res) => {
  try {
    const { id } = req.params;

  
    const post = await posts.findById(id);
    if (!post) {
      return res.status(404).json({ errorMsg: "Post not found" });
    }

    
    const imageFileName = post.post_image;

    if(imageFileName) {
      const imgRef = ref(fireBaseStorage, `images/${imageFileName}`);
      console.log(imgRef);

      try {
        await getMetadata(imgRef);
        try {
          await deleteObject(imgRef);
          console.log('File deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting file:', deleteError);
          throw new Error("Error deleting file from Firebase Storage");
        }
      } catch (metadataError) {
        if (metadataError.code === 'storage/object-not-found') {
          console.log('File does not exist, no need to delete');
        } else {
          console.error('Error getting file metadata:', metadataError);
          throw new Error("Error checking file existence in Firebase Storage");
        }
      }
    }


    // Delete the post from the database
    const deletePost = await posts.findOneAndDelete({ _id: id });

    res.status(200).json(deletePost);
  } catch (e) {
    console.log(e);
    res.status(500).json({ errorMsg: "Error in deleting post by ID" });
  }
};

exports.deletePostByEmail = async (req, res) => {
  try {
    const { emailParam } = req.params;

    const deletePost = await posts.findOneAndDelete({ email: emailParam });

    const imageFileName = deletePost.post_image;

    if(imageFileName) {
      const imgRef = ref(fireBaseStorage, `images/${imageFileName}`);
      console.log(imgRef);

      try {
        await getMetadata(imgRef);
        try {
          await deleteObject(imgRef);
          console.log('File deleted successfully');
        } catch (deleteError) {
          console.error('Error deleting file:', deleteError);
          throw new Error("Error deleting file from Firebase Storage");
        }
      } catch (metadataError) {
        if (metadataError.code === 'storage/object-not-found') {
          console.log('File does not exist, no need to delete');
        } else {
          console.error('Error getting file metadata:', metadataError);
          throw new Error("Error checking file existence in Firebase Storage");
        }
      }
    }

    res.status(200).json(deletePost);
  } catch (e) {
    console.log(e)
    res.status(401).json({errorMsg: "error in delete posts by id"});
  }
}

exports.deleteAllPosts = async (req, res) => {
  try {
    await posts.deleteMany({});
    res.status(200).json({ message: "All posts deleted successfully" });
  } catch (error) {
    console.error("Error deleting all posts:", error);
    res.status(500).json({ error: "An error occurred while deleting all posts" });
  }
};

exports.getAllImageFileNamesFromUpload = async (req, res) => {
  console.log("sdnsjd");
  try {
    const uploadsDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ errorMsg: "Uploads directory not found" });
    }

    const fileNames = fs.readdirSync(uploadsDir);
    console.log(fileNames)

    res.status(200).json({ files: fileNames });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errorMsg: "Error in fetching image file names" });
  }
};

exports.deleteImageByFileNameFromUpload = async (req, res) => {
  const { fileName } = req.body;
  
  try {

    const imagePath = path.join(__dirname, "../uploads", fileName);

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ errorMsg: "Image file not found" });
    }

    fs.unlinkSync(imagePath);

    res.status(200).json({ message: "Image file deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errorMsg: "Error in deleting image file" });
  }
};



