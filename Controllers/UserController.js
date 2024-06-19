const users = require("../models/UserSchema");
const userPassword = require("../models/UserPasswordSchema");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

const saveBase64Image = async (base64String, fileName) => {
  const matches = await base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }

  const ext = matches[1].split("/")[1];
  const data = matches[2];
  const buffer = await Buffer.from(data, "base64");
  const uploadsDir = await path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = await path.join(uploadsDir, `${fileName}.${ext}`);
  await fs.writeFileSync(filePath, buffer);
  return `${fileName}.${ext}`;
};

exports.userpost = async (req, res) => {

  const { profile_image, originalFileName } = req.body;

  const fileName = (profile_image ? await saveBase64Image(
    profile_image,
    (originalFileName ? `${originalFileName || "image"}_${Date.now()}`: "generalPerson.jpeg")
  ) : "generalPerson.jpeg"
);
  const { userName, email, mobile ,password, user_description} = req.body;

  if (!userName || !email || !mobile || !fileName || !password) {
    res.status(401).json("All fields are required");
    return;
  }

  try {
    const preUser = await users.findOne({ email: email });

    const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

    

    if (preUser) {
      res.status(401).json("User already exists");
    } else {
      
      const userData = new users({
        userName,
        email,
        mobile,
        profile_image: fileName,
        user_description : user_description || "Hi, am a new user ",
        connections: [],
        requests: [],
        money: 0,
        coupons: [],
        dateCreated,
      });
      await userData.save();

      const userPasswordData = new userPassword({
        email,
        password,
      });
      await userPasswordData.save();


      // const userData = new users({
      //   userName,
      //   email,
      //   mobile,
      //   profile_image: fileName,
      //   connections: [
      //     {
      //       userName: "zzzzzz",
      //       email: "zzz@gmail.com",
      //       profile_image: "1.png",
      //     },
      //   ],
      //   requests: [
      //     {
      //       userName: "zzzzzz",
      //       email: "zzz@gmail.com",
      //       profile_image: "1.png",
      //     },
      //   ],
      //   money: 0,
      //   coupons: [
      //     {
      //       name: "New User",
      //       money: 5000,
      //     },
      //   ],
      //   dateCreated,
      // });

      res.status(200).json(userData);
    }
  } catch (e) {
    res.status(401).json(e);
    console.log("Database upload error");
    console.log(e);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const usersData = await users.find();
    res.status(200).json(usersData);
  } catch (e) {
    res.status(401).json(e);
  }
};

exports.getSingleUser = async (req, res) => {
  try {
    const { emailParam } = req.params;
    const userData = await users.findOne({ email: emailParam });
    res.status(200).json(userData);
  } catch (e) {
    res.status(401).json(e);
  }
};

exports.editUserData = async (req, res) => {
  const { emailParam } = req.params;

  const oldUserData = await users.findOne({ email: emailParam });

  const {
    userName,
    email,
    mobile,
    profile_image,
    originalFileName,
    connections,
    requests,
    money,
    coupons,
    user_description,
  } = req.body;

  let fileName = null;

  if (profile_image && originalFileName) {
    fileName = await saveBase64Image(profile_image, `${originalFileName}_${Date.now()}`);

    const oldImagePath = path.join(__dirname, "../uploads", oldUserData.profile_image);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }
  }

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    

    const updateUser = await users.findOneAndUpdate({ email: emailParam },
      {
        userName: userName || oldUserData.userName,
        email: email || oldUserData.email,
        mobile: mobile || oldUserData.mobile,
        user_description: user_description || oldUserData.user_description,
        profile_image: fileName || oldUserData.profile_image,
        connections: connections || oldUserData.connections,
        requests: requests || oldUserData.requests,
        money: money || oldUserData.money,
        coupons: coupons || oldUserData.coupons,
        dateUpdated,
      },
      {
        new: true,
      }
    );

    await updateUser.save();

    res.status(200).json(updateUser);
  } catch (e) {
    res.status(401).json(e);
    console.log(e);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { emailParam } = req.params;
    const deleteUser = await users.findOneAndDelete({ email: emailParam });
    const deleteUserPassword = await userPassword.findOneAndDelete({
      email: emailParam,
    });
    res.status(200).json({ ...deleteUser });
  } catch (e) {
    res.status(401).json(e);
  }
};

exports.loginUser = async (req, res) => {

  const { email, password } = req.body;

  try {
    const userData = await userPassword.findOne({ email: email });
    if(userData.password !== password) {
      res.status(200).json(false);
    }else res.status(200).json(true);

  }catch(e){
    console.log(e);
    res.status(401).json({"errorMsg": "Invalid Credentials" });
  }

}

exports.getFollowersCount = async (req, res) => {
  const { emailParam } = req.body;

  try{
    let usersData = await users.find();
    // console.log(usersData);

    usersData = usersData || [];

    let cnt = 0;
    let followlers=[];

    

    for(let j=0;j<usersData.length;j++) {
        const connectionList = usersData[j].connections;
        for(let i=0;i<connectionList.length;i++)
        {
            if(connectionList[i].email===emailParam)
            {
              console.log(connectionList[i]);
              cnt++;
              followlers.push({
                userName: usersData[j].userName,
                email: usersData[j].email,
                profile_image: usersData[j].profile_image,
              })
            }
        }
    }
 
    res.status(200).json({
      followersCnt:cnt,
      followersAccounts: followlers,
    });


  }catch(e){
    console.log(e);
    res.status(401).json({"errorMsg": "Error while fetching ur friends" });
  }

}

exports.allUsersCollection = async (req, res) => {
  try {
    await users.deleteMany({});
    res.status(200).json({ message: "All user deleted successfully" });
  } catch (error) {
    console.error("Error deleting all posts:", error);
    res.status(500).json({ error: "An error occurred while deleting all posts" });
  }
}

exports.allUserPasswordCollection = async (req, res) => {
  try {
    await userPassword.deleteMany({});
    res.status(200).json({ message: "All usersPass deleted successfully" });
  } catch (error) {
    console.error("Error deleting all posts:", error);
    res.status(500).json({ error: "An error occurred while deleting all posts" });
  }
}