import { Router } from "express";
const router = Router();
import { cardMongoData } from "../data/index.js";
import { userAccount } from "../data/createUser.js";
import validation from "../data/validation.js";
import xss from 'xss';
import {
  loginUser,
  getUserByUsername,
  findUsersByUsernameSubstring,
  getCardListByUsername,
  getUserCardDetails,
  getLimitedCardDetails,
  executeTrade,
  getTradeDetails,
  finalizeTrade,
  getAllUserDeckPoints,
  getFriendList,
  displayCollection,
  declineTrade,
  getUserById,
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
      } catch (err) {
        req.session.error = err.message;
        return res.status(403).redirect('error');
      }

      if (newUser.insertedUser === true) {
        res.redirect("/login");
      } else {
        res.status(500).render("register", {
          error: "Internal Server Error",
          loggedIn: req.session.user ? true : false
        });
      }
    } catch (error) {
      res.status(400).render("register", {
        error: error.message,
        loggedIn: req.session.user ? true : false
      });
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    res.render("login", {
      loggedIn: req.session.user ? true : false
    });
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
        console.error("Login error:", err.message);
        req.session.error = err.message;
        return res.status(403).redirect("error");
      }

      if (newLogin) {
        req.session.user = {
          userName: newLogin.userName,
        };
      }

      req.session.save((error) => {
        if (error) {
          console.error("Session save error:", error);
          console.error(error);
          return res.status(500).render("login", {
            error: "Failed to save session.",
            loggedIn: req.session.user ? true : false
          });
        }
        return res.redirect("/protected");
      });
    } catch (error) {
      console.error("Critical error:", error);
      res.status(400).render("login", {
        error: error.message,
        loggedIn: req.session.user ? true : false
      });
    }
  });

router.route("/protected").get(async (req, res) => {
  if (!req.session.user) {
    req.session.error = "403: You do not have permission to access this page.";
    return res.status(403).redirect("error");
  }
  const sanitizedUsername = xss(req.session.user.userName);
  //const user = await getUserByUsername(req.session.user.userName);
  const user = await getUserByUsername(sanitizedUsername);
  const friendRequests = user.friendRequests;

  res.render("protected", {
    //userName: req.session.user.userName,
    userName: sanitizedUsername,
    currentTime: new Date().toLocaleTimeString(),
    friendRequests: friendRequests,
    loggedIn: req.session.user ? true : false
  });
});

router.route("/ranking").get(async (req, res) => {
  let data = await getAllUserDeckPoints();
  res.render("ranking", { 
    data: data,
    loggedIn: req.session.user ? true : false
  });
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
      buttonsTurnedOff: true
    });
  });
});

// Route for handling search and adding friends
router
  .route("/searchUsers")
  .get(async (req, res) => {
    res.render("searchUsers", {
      loggedIn: req.session.user ? true : false
    });
  })
  .post(async (req, res) => {
    try {
      const { username } = req.body;

      const foundUsers = await findUsersByUsernameSubstring(username);

      if (foundUsers.length===0) {

        return res.render('searchUsers', { 
          message: "User not found",
          noMatch: true,
          loggedIn: req.session.user ? true : false
         });
      }

      res.render("searchUsers", { 
        users: foundUsers,
        loggedIn: req.session.user ? true : false,
        noMatch: true
       });
    } catch (error) {
      console.error("Error searching for user:", error);
      res.render('error', { 
        error: error.message,
        loggedIn: req.session.user ? true : false
       }); // Pass the error message to the error page
    }
  });

// Route for adding a friend
router.post("/addFriend", async (req, res) => {
  try {

    const senderUsername = xss(req.session.user.userName); // Retrieve sender's username from session user
    const receiverUsername = xss(req.body.username); // Retrieve receiver's username from form

    await userAccount.sendFriendRequest(senderUsername, receiverUsername);

    //res.redirect("/searchUsers");
    res.render('searchUsers', {
      requestSent: true,
      loggedIn: req.session.user ? true : false,
    });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.render("error", { 
      error: error.message,
      loggedIn: req.session.user ? true : false
    });
  }
});

router
  .route("/trade")
  .get(async (req, res) => {
    return res.render("tradeHome", {
      loggedIn: req.session.user ? true : false
    });
  })

  .post(async (req, res) => {
    let { tradeSearchUser } = req.body;
    let tradeSender = xss(req.session.user.userName);

    if (!tradeSearchUser || !tradeSender) {
      throw "There is no trader or tradee";
    }

    if (
      typeof tradeSearchUser !== "string" ||
      typeof tradeSender !== "string"
    ) {
      throw "Invalid types for trader or tradee";
    }
    tradeSender = tradeSender.trim();
    tradeSearchUser = tradeSearchUser.trim();

    if (tradeSender === "" || tradeSearchUser === "") {
      throw "trader and tradee cannot be empty strings ";
    }

    try {
      const user = await getUserByUsername(tradeSearchUser); //more client side error checking
      const userName = user.userName;
      if (userName === tradeSender) {
        throw "Silly you, you cannot trade with yourself!";
      }
      return res.redirect(`trade/${userName}`);
    } catch (error) {
      return res.status(404).render("error", {
        error: error,
        loggedIn: req.session.user ? true : false
      });
    }
  });

router
  .route("/trade/:userName")
  .get(async (req, res) => {
    let sender = req.session.user.userName;
    let reciever = req.params.userName;

    if (!sender || !reciever) {
      throw "There is no sender or reciever";
    }

    if (typeof sender !== "string" || typeof reciever !== "string") {
      throw "Invalid types for sender or reciever";
    }
    sender = sender.trim();
    reciever = reciever.trim();

    if (sender === "" || reciever === "") {
      throw "sender and reciever cannot be empty strings ";
    }

    try {
      const senderCardList = await getUserCardDetails(sender);
      const recieverCardList = await getUserCardDetails(reciever);
      return res.render("trader", {
        sender: sender,
        reciever: reciever,
        senderCardList: senderCardList,
        recieverCardList: recieverCardList,
        loggedIn: req.session.user ? true : false
      });
    } catch (error) {
      return res.render("error", { error: error });
    }
    // res.render("trader", { sender: sender, reciever: reciever });
  })

  .post(async (req, res) => {
    let sender = req.session.user.userName;
    let reciever = req.params.userName;
    let yourSelectedIds = req.body["yourselectedId"];
    let theirSelectedIds = req.body["theirselectedId"];
    let theirTrades = { [sender]: yourSelectedIds };
    let yourTrades = { [reciever]: theirSelectedIds };

    if (!sender || !reciever) {
      throw "There is no sender or reciever";
    }

    if (typeof sender !== "string" || typeof reciever !== "string") {
      throw "Invalid types for sender or reciever";
    }
    sender = sender.trim();
    reciever = reciever.trim();

    if (sender === "" || reciever === "") {
      throw "sender and reciever cannot be empty strings ";
    }

    if (
      !yourSelectedIds ||
      !theirSelectedIds ||
      !Array.isArray(yourSelectedIds) ||
      !Array.isArray(theirSelectedIds)
    ) {
      throw "ID arrays must be provided and of array type";
    }

    let checkYours = yourSelectedIds.every((item) => typeof item === "string");
    let checkTheirs = theirSelectedIds.every(
      (item) => typeof item === "string"
    );

    if (!checkYours || !checkTheirs) {
      throw "All ids must be strings";
    }

    yourSelectedIds = yourSelectedIds.map((id) => id.trim());
    theirSelectedIds = theirSelectedIds.map((id) => id.trim());

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

      res.render("tradeComplete", {
        sender: sender,
        reciever: reciever,
        yourDetails: yourDetails,
        theirDetails: theirDetails,
        loggedIn: req.session.user ? true : false
      });
    } catch (error) {
      return res.render("error", { error: error });
    }
  });

router
  .route("/viewtrades")
  .get(async (req, res) => {
    let user = xss(req.session.user.userName).trim();

    if (!user) {
      throw "No user was found";
    }

    if (typeof user !== "string") {
      throw "user must be string";
    }

    user = user.trim();

    if (user === "") {
      throw "user cannot be empty";
    }

    try {
      let out = await getTradeDetails(user);

      let tradesIn = out.tradesIn;
      let tradesOut = out.tradesOut;
      let tradeInOutList = [];
      let tradeOutOutList = [];

      if (!tradesIn || !tradesOut) {
        throw "TradeIn or TradeOut not found";
      }

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
        loggedIn: req.session.user ? true : false,
      });
    } catch (error) {
      res.render("error", { error: error });
    }
  })
  .post(async (req, res) => {
    let user = xss(req.session.user.userName).trim();

    if (!user) {
      throw "No user was found";
    }

    if (typeof user !== "string") {
      throw "user must be string";
    }

    user = user.trim();

    if (user === "") {
      throw "user cannot be empty";
    }

    const tradeIDs = req.body["tradeInSelectedId"];

    if (!tradeIDs) {
      throw "TradeIDs are not found";
    }

    if (req.body.action === "accept-trade") {
      for (const id of tradeIDs) {
        try {
          await finalizeTrade(id);
        } catch (error) {
          res.render("error", { error: error });
        }
      }
      res.render("tradeAccepted", {
        message: `Congratulations, ${user}. Your trade has been accepted!`,
        user: user,
        loggedIn: req.session.user ? true : false
      });
    }

    if (req.body.action === "decline-trade") {
      for (const id of tradeIDs) {
        try {
          await declineTrade(id);
        } catch (error) {
          res.render("error", { error: error });
        }
      }
      res.render("tradeAccepted", {
        message: `Hello, ${user}. Your trade has been declined!`,
        user: user,
        loggedIn: req.session.user ? true : false
      });
    }
  });

//These all need to be updated to our needs
router
  .route("protected/:id")
  .get(async (req, res) => {
    let validatedId;
    try {
      //req.params.id = validation.checkId(req.params.id);
      validatedId = validation.checkId(xss(req.params.id));
    } catch (e) {
      return res.status(404).render("error", {
        error: "404: Page Not Found",
        loggedIn: req.session.user ? true : false
      });
    }
    try {
      const user = await cardMongoData.getUserById(validatedId);
      return res.json(user);
    } catch (e) {
      return res.status(404).render("error", {
        error: "404: Page Not Found",
        loggedIn: req.session.user ? true : false
      });
    }
  })

  .post(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    return res.send(
      //`POST request to http://localhost:3000/users/${req.params.id}`
      `POST request to http://localhost:3000/users/${validatedId}`
    );
  })
  .delete(async (req, res) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    let validatedId;
    try {
      validatedId = validation.checkId(xss(req.params.id));
    } catch (error) {
      return res.status(400).send("Invalid ID provided.");
    }
    return res.send(
      //`DELETE request to http://localhost:3000/users/${req.params.id}`
      `DELETE request to http://localhost:3000/users/${validatedId}`
    );
  });

router.route("/viewCollections/:userName").get(async (req, res) => {
  if (!req.session.user) {
    req.session.error = "403: You do not have permission to access this page";
    return res.status(403).redirect("error");
  }
  try {
    const user = xss(req.session.user.userName);

    const friendList = await getFriendList(user);

    friendList.push(user);
    const images = {};
 

    for (const usr of friendList) {
      const imageData = await displayCollection(usr);
      images[usr] = imageData;
    }

    const imagesJSON = JSON.stringify(images);

    return res.render("collectionView", {
      user,
      friendList,
      imagesJSON,
      loggedIn: req.session.user ? true : false
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.route("/viewSearchCollections/:searchUserName").get(async (req, res) => {
  if (!req.session.user) {
    req.session.error = "403: You do not have permission to access this page";
    return res.status(403).redirect("error");
  }
  try {
    const user = xss(req.params.searchUserName);

    const images = {};
   
    const imageData = await displayCollection(user);
    images[user] = imageData;

    return res.render("searchCollectionView", {
      user,
      imageData,
      loggedIn: req.session.user ? true : false
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).send("Internal Server Error");
  }
});

router.route('/error').get(async (req, res) => {

  const error = req.session.error; 
  req.session.error = null;

  const sanitizedError = xss(error);

  return res.render('error', {
    error: sanitizedError,
    loggedIn: req.session.user ? true : false,
  });
});
 //reject friend request
router.route("/rejectFriendRequest").post(async (req, res) => {
  try {
    const senderUsername = xss(req.body.username);
    const receiverUsername = xss(req.session.user.userName);

    await userAccount.rejectFriendRequest(receiverUsername, senderUsername);

    const updatedUser = await getUserByUsername(receiverUsername);
    const friendRequests = updatedUser.friendRequests || [];

    req.session.friendRequests = friendRequests;

    res.redirect('/protected');

  }
  catch (error) {
    console.error('Error rejecting friend:', error);
    res.render('error', { 
      error: error.message,
      loggedIn: req.session.user ? true : false 
    });
  }


});
//accept friend request
router.route("/acceptFriendRequest").post(async (req, res) => {
  try {
    const senderUsername = xss(req.body.username);
    const receiverUsername = xss(req.session.user.userName);

    await userAccount.acceptFriendRequest(receiverUsername,senderUsername);

    const updatedUser = await getUserByUsername(receiverUsername);
   
    const friendRequests = updatedUser.friendRequests || [];
   
    req.session.friendRequests = friendRequests;

    res.redirect('/protected');

  }

  catch (error) {
    console.error('Error accepting friend:', error);
    res.render('error', { 
      error: error.message,
      loggedIn: req.session.user ? true : false
    });
  }


});
//friend's list
router.route("/friendsList").get(async (req, res) => {
  if (req.session.user && req.session.user.userName) {
    try {
      const senderUsername = xss(req.session.user.userName);
      const friends = await userAccount.getAllFriends(senderUsername);
      res.render('friendsList', { 
        friends,
        loggedIn: req.session.user ? true : false
      });
    } catch (error) {
      console.log('An error occurred while finding friends:', error);
      res.render('error', { error: error.message });
    }
  }
  else {
    res.render('error', {
      error: "You are not logged in",
      loggedIn: req.session.user ? true : false
    })
  }
});

export default router;
