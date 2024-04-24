import { Router } from "express";
const router = Router();
import { cardMongoData } from "../data/index.js";
import { userAccount } from "../data/createUser.js";
import validation from "../data/validation.js";
import {
  loginUser,
  getUserByUsername,
  getCardListByUsername,
  getUserCardDetails,
  getLimitedCardDetails,
  executeTrade,
  getTradeDetails,
  finalizeTrade,
  getAllUserDeckPoints,
  getFriendList,
  displayCollection
} from "../data/pokemonMongo.js";

router
  .route("/register")
  .get(async (req, res) => {
    return res.render("./register", {
      loggedIn: req.session.user ? true : false,
    });
  })
  .post(async (req, res) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Not a valid JSON" });
    }
    const { userNameInput, passwordInput, confirmPasswordInput } = req.body;
    if (!userNameInput) {
      return res.status(400).json({ error: "Please supply User Name" });
    }
    if (!passwordInput) {
      return res.status(400).json({ error: "Please enter Password" });
    }
    if (!confirmPasswordInput) {
      return res.status(400).json({ error: "Please confirm Password" });
    }

    try {
      validation.checkString(userNameInput, "User Name");
      let newUser;

      try {
        newUser = await userAccount.createUser(userNameInput, passwordInput);
      } catch (error) {
        req.session.error = error.message;
        return res.render("error", {error:"An error occured while registering user"});
      }

      if (newUser.insertedUser === true) {
        res.redirect("/login");
      } else {
        res.status(500).render("register", {
          error: "Internal Server Error",
          loggedIn: req.session.user ? true : false,
        });
      }
    } catch (error) {
      res.status(400).render("register", {
        error: error.message,
        loggedIn: req.session.user ? true : false,
      });
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Not a valid JSON" });
    }

    const { userNameInput, passwordInput } = req.body;

    if (!userNameInput || !passwordInput) {
      return res
        .status(400)
        .json({ error: "User Name and Password are required" });
    }

    try {
      if (!validation.checkString("User Name", userNameInput)) {
        throw new Error("Invalid User Name");
      }

      if (!validation.checkPassword(passwordInput)) {
        throw new Error("Invalid password.");
      }

      let newLogin;

      try {
        newLogin = await loginUser(userNameInput, passwordInput);
      } catch (err) {
        console.log(passwordInput);
        console.error("Login error:", err.message);
        req.session.error = err.message;
        return res.status(403).redirect("error");
      }
      console.log('here',newLogin);
      if (newLogin) {
        req.session.user = {
          userName: newLogin.userName,
        };
        req.session.friendRequests= newLogin.friendRequests;
        console.log(req.session.friendRequests);
      }

      req.session.save((error) => {
        if (error) {
          console.error("Session save error:", error);
          console.error(error);
          return res.status(500).render("login", {
            error: "Failed to save session.",
            loggedIn: req.session.user ? true : false,
          });
        }
        return res.redirect("/protected");
      });
    } catch (error) {
      console.error("Critical error:", error);
      res.status(400).render("login", {
        error: error.message,
        loggedIn: req.session.user ? true : false,
      });
    }
  });

router.route("/protected").get(async (req, res) => {
  if (!req.session.user) {
    req.session.error = "403: You do not have permission to access this page.";
    return res.status(403).redirect("error");
  }
  const user = req.session.user;
  const friendRequests = req.session.friendRequests;
  console.log(friendRequests);
  res.render("protected", {
    userName: req.session.user.userName,
    currentTime: new Date().toLocaleTimeString(),
    friendRequests: friendRequests
  });
});

router.route("/ranking").get(async (req, res) => {
  let data = await getAllUserDeckPoints();
  res.render("ranking", {data: data});
});

router.route("/logout").get(async (req, res) => {
  if (!req.session.user) {
    req.session.error =
      "403: You are not logged in.  You can't log out if your aren't logged in.";
    loggedIn: req.session.user ? true : false;
    return res.status(403).redirect("error");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error deleting session cookie:", err);
    }
    res.clearCookie("AuthState");
    return res.render("./logout", {
      loggedIn: false,
    });
  });
});

// Route for handling search and adding friends
router.route("/searchUsers")
  .get(async (req, res) => {
    res.render("searchUsers");
  })
  .post(async (req, res) => {
    try {
      const { username } = req.body;
      const foundUsers = await getUserByUsername(username);

      if (!foundUsers || foundUsers.length === 0) {
        return res.render('SearchUsers', { message: 'No users found' });
      }

      res.render('SearchUsers', { users: foundUsers }); // Pass the search results to the SearchUsers 
    } catch (error) {
      console.error('Error searching for user:', error);
      res.render('error', { error: error.message }); // Pass the error message to the error page
    }
  });


// Route for adding a friend. It adds this under both sender/receiver
router.post('/addFriend', async (req, res) => {
  try {
    const senderUsername = req.session.user.userName; // Retrieve sender's username from session user
    const receiverUsername = req.body.username; // Retrieve receiver's username from form

    // console.log('Sender Username:', senderUsername);
    // console.log('Receiver Username:', receiverUsername);

    await userAccount.sendFriendRequest(senderUsername, receiverUsername);

    res.redirect('/searchUsers');

  } catch (error) {
    console.error('Error adding friend:', error);
    res.render('error', { error: 'An error occurred while adding friend' });
  }
});
//Accept friend request route -TODO

router.route("/acceptFriendRequest").post(async (req, res) => {
  try {
    const senderUsername = req.session.user.userName;
    const receiverUsername = req.body.username;

    await userAccount.acceptFriendRequest(receiverUsername, senderUsername);

    const updatedUser = await getUserByUsername(senderUsername);
   
    const friendRequests = updatedUser.friendRequests || [];
   
    req.session.friendRequests = friendRequests;
    console.log(req.session);
    console.log(friendRequests);

    res.redirect('/protected');

  }

  catch (error) {
    console.error('Error accepting friend:', error);
    res.render('error', { error: 'An error occurred while accepting friend' });
  }


});

//reject friend request

router.route("/rejectFriendRequest").post(async (req, res) => {
  try {
    const senderUsername = req.session.user.userName;
    const receiverUsername = req.body.username;

    await userAccount.rejectFriendRequest(receiverUsername, senderUsername);

    const updatedUser = await getUserByUsername(senderUsername);
    console.log(updatedUser);
    const friendRequests = updatedUser.friendRequests || [];

    req.session.friendRequests = friendRequests;
    console.log(friendRequests);

    res.redirect('/protected');

  }
  catch (error) {
    console.error('Error rejecting friend:', error);
    res.render('error', { error: 'An error occurred while rejecting friend' });
  }


});


//friend's list
router.route("/friendsList").get(async (req, res) => {
  try {
    const senderUsername = req.session.user.userName;
    const friends = await userAccount.getAllFriends(senderUsername);
    res.render('friendsList', { friends });
  } catch (error) {
    console.log('An error occurred while finding friends:', error);
    res.render('error', { error: 'An error occurred while finding friends' });
  }

});


router
  .route("/trade")
  .get(async (req, res) => {
    return res.render("tradeHome");
  })

  .post(async (req, res) => {
    const { tradeSearchUser } = req.body;
    // do error checks for this on client side
    try {
      const user = await getUserByUsername(tradeSearchUser); //more client side error checking
      const userName = user.userName;
      return res.redirect(`trade/${userName}`);
    } catch (error) {
      return res.status(404).json(`Error: ${error}`);
    }
  });

router
  .route("/trade/:userName")
  .get(async (req, res) => {
    const sender = req.session.user.userName;
    const reciever = req.params.userName;
    try {
      const senderCardList = await getUserCardDetails(sender);
      const recieverCardList = await getUserCardDetails(reciever);
      return res.render("trader", {
        sender: sender,
        reciever: reciever,
        senderCardList: senderCardList,
        recieverCardList: recieverCardList,
      });
    } catch (error) {
      return res.status(404).json(`Error: ${error}`);
    }
    // res.render("trader", { sender: sender, reciever: reciever });
  })

  .post(async (req, res) => {
    const sender = req.session.user.userName;
    const reciever = req.params.userName;
    const yourSelectedIds = req.body["yourselectedId"];
    const theirSelectedIds = req.body["theirselectedId"];
    let theirTrades = { [sender]: yourSelectedIds };
    let yourTrades = { [reciever]: theirSelectedIds };

    let yourDetails = await Promise.all(
      yourSelectedIds.map(async (id) => {
        return await getLimitedCardDetails(id);
      })
    );

    if (!yourDetails) {
      throw "Error getting your details";
    }

    let theirDetails = await Promise.all(
      theirSelectedIds.map(async (id) => {
        return await getLimitedCardDetails(id);
      })
    );

    if (!yourDetails) {
      throw "Error getting their detail";
    }

    try {
      let out = await executeTrade(sender, reciever, yourTrades, theirTrades);
      console.log("Out completed");

      res.render("tradeComplete", {
        sender: sender,
        reciever: reciever,
        yourDetails: yourDetails,
        theirDetails: theirDetails,
      });
    } catch (error) {
      return res.status(404).json(`Error: ${error}`);
    }
  });

router
  .route("/viewtrades")
  .get(async (req, res) => {
    const user = req.session.user.userName;
    let out = await getTradeDetails(user);

    let tradesIn = out.tradesIn;
    let tradesOut = out.tradesOut;
    let tradeInOutList = [];
    let tradeOutOutList = [];

    tradesIn.forEach((trades) => {
      let tradeInGet = trades[1];
      let tradeInGetName = Object.keys(tradeInGet)[0];
      let tradeInGetListString = tradeInGet[tradeInGetName].join(", ");
      let tradeInSend = trades[2];
      let tradeInSendName = Object.keys(tradeInSend)[0];
      let tradeInSendListString = tradeInSend[tradeInSendName].join(", ");
      let tradeID = trades[0];
      tradeInOutList.push({
        description: `Incoming Trade: You get ${tradeInGetListString} for ${tradeInSendListString} from ${tradeInGetName}`,
        tradeID: tradeID,
      });
    }); //each tradein, in pairs of [{tradeFrom: [cards], tradeTo: [cards]}]

    tradesOut.forEach((trades) => {
      let tradeOutSend = trades[1];
      let tradeOutSendName = Object.keys(tradeOutSend)[0];
      let tradeOutSendListString = tradeOutSend[tradeOutSendName].join(", ");
      let tradeOutGet = trades[2];
      let tradeOutGetName = Object.keys(tradeOutGet)[0];
      let tradeOutGetListString = tradeOutGet[tradeOutGetName].join(", ");
      let tradeID = trades[0];
      tradeOutOutList.push({
        description: `Outgoing Trade ${tradeID}: You get ${tradeOutSendListString} for ${tradeOutGetListString} from ${tradeOutSendName} `,
        tradeID: tradeID,
      });
    }); //each tradeout, in pairs of [{tradeTo: [cards], tradeFrom: [cards]}]

    return res.render("tradeRequest", {
      tradeInOutList: tradeInOutList,
      tradeOutOutList: tradeOutOutList,
    });
  })
  .post(async (req, res) => {
    const tradeIDs = req.body["tradeInSelectedId"];
    for (const id of tradeIDs) {
      try {
        await finalizeTrade(id);
      } catch (error) {
        console.error("Error pulling card from cardList:", error);
      }
    }
    res.render("tradeAccepted", {
      message: "Your trade has been confirmed! Go check out your new cards 👾",
    });
  });

//These all need to be updated to our needs
router
  .route("protected/:id")
  .get(async (req, res) => {
    try {
      req.params.id = validation.checkId(req.params.id);
    } catch (e) {
      return res.status(404).render("error", {
        error: "404: Page Not Found",
        loggedIn: req.session.user ? true : false,
      });
    }
    try {
      const user = await cardMongoData.getUserById(req.params.id);
      return res.json(user);
    } catch (e) {
      return res.status(404).render("error", {
        error: "404: Page Not Found",
        loggedIn: req.session.user ? true : false,
      });
    }
  })

  .post(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    return res.send(
      `POST request to http://localhost:3000/users/${req.params.id}`
    );
  })
  .delete(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    return res.send(
      `DELETE request to http://localhost:3000/users/${req.params.id}`
    );
  });

router
  .route("/viewCollections/:userName")
  .get(async (req, res) => {
    if(!req.session.user) {
      req.session.error = "403: You do not have permission to access this page";
      return res.status(403).redirect("error");
    }
    try {
      const user = req.session.user.userName;
      //console.log("user", user)
      const friendList = await getFriendList(user);
      //console.log("route friend list: ", friendList);
      friendList.push(user);
      const images = {};
      //console.log("route iamges: ", images);
      
      for(const usr of friendList) {
        const imageData = await displayCollection(usr)
        images[usr] = imageData
      }
      //console.log(images)
      const imagesJSON = JSON.stringify(images)
      //console.log(imagesJSON)
      return res.render("collectionView", {
          user,
          friendList,
          imagesJSON
      });
  } catch (error) {
      console.error("Error fetching data:", error);
      return res.status(500).send("Internal Server Error");
  }
  })

export default router;
