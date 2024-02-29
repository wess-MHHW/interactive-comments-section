/*
  Comment Structure:
    - Container 
        - Top-level comment
        - Section
          - Low-level comments
*/

// CLASSES
// USERIMAGE CLASS
class UserImage {
  constructor(png, webp) {
    this.png = png;
    this.webp = webp;
  }
}

// USER CLASS
class User {
  constructor(username, image) {
    this.username = username;
    this.image = image;
  }
}

// COMMENT
class Comment {
  constructor(
    content,
    user,
    score = 0,
    replyingTo = undefined,
    createdAt = new Date(),
    scoreDetails = {}
  ) {
    this.id = crypto.randomUUID();
    this.content = content;
    this.createdAt = createdAt;
    this.score = score;
    this.scoreDetails = scoreDetails;
    this.user = user;
    this.replies = [];
    this.replyingTo = replyingTo;
  }

  updateContent(content) {
    this.content = content;
  }

  updateScore(username, newValue) {
    if (this.user.username !== username) {
      let value = this.scoreDetails.hasOwnProperty(username)
        ? this.scoreDetails[username]
        : 0;
      if (value + newValue < 2 && value + newValue > -2) {
        this.score += newValue;
        this.scoreDetails[username] = value + newValue;
      }
    }
    return this.score;
  }

  addReply(comment) {
    this.replies.push(comment);
  }

  removeReply(comment) {
    const index = this.replies.indexOf(comment);
    if (index !== -1) {
      this.replies.splice(index, 1);
    }
  }
}

// FUNCTIONS
const createUser = (userData) => {
  return new User(
    userData["username"],
    new UserImage(userData["image"]["png"], userData["image"]["webp"])
  );
};

const createComment = (commentData) => {
  let comment = new Comment(
    commentData["content"],
    createUser(commentData["user"]),
    commentData["score"],
    undefined,
    commentData["createdAt"],
    commentData["scoreDetails"] ? commentData["scoreDetails"] : {}
  );

  if (commentData["replies"].length) {
    commentData["replies"].forEach((replyData) => {
      let reply = new Comment(
        replyData["content"],
        createUser(replyData["user"]),
        replyData["score"],
        replyData["replyingTo"],
        replyData["createdAt"],
        commentData["scoreDetails"] ? commentData["scoreDetails"] : {}
      );
      comment.addReply(reply);
    });
  }

  return comment;
};

const fetchDATA = async () => {
  try {
    // Try retrieving data from localStorage
    const storedData = [
      localStorage.getItem("currentUser")
        ? JSON.parse(localStorage.getItem("currentUser"))
        : null,
      localStorage.getItem("comments")
        ? JSON.parse(localStorage.getItem("comments"))
        : null,
    ];

    if (storedData.every((item) => item !== null)) {
      let user = createUser(storedData[0]);
      let comments = storedData[1].map(createComment);
      return {
        user,
        comments,
      };
    }

    // Try fetch data from "data.json"
    const response = await fetch("data.json");
    const data = await response.json();
    let user = createUser(data["currentUser"]);
    let comments = data["comments"].map(createComment);

    // Store data in localStorage for future use
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("comments", JSON.stringify(comments));

    return {
      user,
      comments,
    };
  } catch (error) {
    console.error("Error retrieving data", error);
  }
};

const orderCommentsByScore = (comments) => {
  return comments.sort((a, b) => b.score - a.score);
};

const formatDate = (date) => {
  const currentDate = new Date();
  const inputDate = new Date(date);
  const timeDifference = currentDate - inputDate;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (weeks > 0) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? "yesterday" : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    return "just now";
  }
};

const createCommentHTML = (comment, user) => {
  let div = document.createElement("div");
  div.className = "comment";
  div.id = comment.id;
  div.innerHTML = `
  <div class="score">
    <button type="button" aria-label="increment" id="increment-button">
      <svg width="11" height="11" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z"
          fill="#C5C6EF"
        />
      </svg>
    </button>
    <strong id="score">${comment.score}</strong>
    <button type="button" aria-label="decrement" id="decrement-button">
      <svg width="11" height="3" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z"
          fill="#C5C6EF"
        />
      </svg>
    </button>
  </div>
  <div class="comment-info">
    <img
      src="${comment.user.image.png}"
      alt="${comment.user.username} image"
    />
    <div class="data">
      <strong id="username">${comment.user.username}</strong>
      <strong id="current-user" class="${
        comment.user.username !== user.username ? "hide" : ""
      }">you</strong>
      <strong class="created-at">${formatDate(comment.createdAt)}</strong>
    </div>
  </div>
  <div class="comment-content">
    <p>
    ${
      comment.replyingTo
        ? `<span class="reply-to">@${comment.replyingTo}</span>`
        : ""
    } ${comment.content}
  </p>
  </div>
  <div class="buttons">
    <button type="button" id="delete-button" class="${
      comment.user.username !== user.username ? "hide" : ""
    }">
      <img src="./images/icon-delete.svg" alt="delete icon" />
      Delete
    </button>
    <button type="button" id="${
      comment.user.username !== user.username ? "reply" : "edit"
    }-button">
      <img src="./images/icon-${
        comment.user.username !== user.username ? "reply" : "edit"
      }.svg" alt="${
    comment.user.username !== user.username ? "reply" : "edit"
  } icon" />
      ${comment.user.username !== user.username ? "Reply" : "Edit"}
    </button>
  </div>`;
  return div;
};

const createTextFieldHTML = (user, type, to) => {
  let form = document.createElement("form");
  form.innerHTML = `
  <img src="${user.image.png}" alt="${user.username}" />
  <textarea name="message" id="message" cols="30" rows="3" placeholder="Add a comment...">${
    type === "Reply" ? `@${to}` : ""
  }</textarea>
  <button type="submit" id="${type.toLowerCase()}-button">${type}</button>
  `;
  return form;
};

const sendEventListener = (textFieldElement, user) => {
  const send = textFieldElement.querySelector("#send-button");
  const input = textFieldElement.querySelector("#message");
  if (send) {
    send.addEventListener("click", (e) => {
      e.preventDefault();
      let content = input.value.trim();
      if (content.length !== 0) {
        let comment = new Comment(content, user);
        comments.push(comment);
        localStorage.setItem("comments", JSON.stringify(comments));
        input.value = null;
        const discs = document.querySelectorAll(".disc");
        discs[discs.length - 1].after(displayComment(comment, user));
      }
    });
  }
};

const confirmReplyEventListener = (textFieldElement, id, to, user) => {
  const reply = textFieldElement.querySelector("#reply-button");
  const input = textFieldElement.querySelector("#message");
  if (reply) {
    reply.addEventListener("click", (e) => {
      e.preventDefault();
      let content = input.value.trim();
      if (content.length !== 0) {
        if (content.startsWith(`@${to} `)) {
          content = content.substring(`@${to} `.length);
        }
        let comment = new Comment(content, user, 0, to);

        /*
         THREE CASES :
            TOP LEVEL ELEMENT WITHOUT ANY REPLIES
            TOP LEVEL ELEMENT WITH MULTIPLE REPLIES
            LOW LEVEL ELEMENT 

        */
        let topLevelComment = comments.find((element) => element.id === id);
        if (topLevelComment) {
          let first;
          first = !Boolean(topLevelComment.replies.length);
          topLevelComment.replies.push(comment);
          localStorage.setItem("comments", JSON.stringify(comments));
          if (first) {
            // TOP LEVEL ELEMENT WITHOUT ANY REPLIES
            let section = document.createElement("section");
            section.className = "replies";
            let result = createCommentHTML(comment, user);
            attachCommentEventListeners(result, comment, user);
            section.appendChild(result);

            let parent = textFieldElement.parentElement;
            textFieldElement.remove();
            parent.appendChild(section);
          } else {
            // TOP LEVEL ELEMENT WITH MULTIPLE REPLIES
            let result = createCommentHTML(comment, user);
            attachCommentEventListeners(result, comment, user);

            let parent = textFieldElement.parentElement;
            textFieldElement.remove();
            parent.querySelector(".replies").appendChild(result);
          }
        } else {
          // LOW LEVEL ELEMENT
          let index;
          comments.forEach((item, i) => {
            let x = item.replies.findIndex((element) => element.id === id);
            if (x !== -1) {
              index = i;
            }
          });

          comments[index].replies.push(comment);
          localStorage.setItem("comments", JSON.stringify(comments));

          let result = createCommentHTML(comment, user);
          attachCommentEventListeners(result, comment, user);
          let parent = textFieldElement.parentElement;
          textFieldElement.remove();
          parent.appendChild(result);
        }
      }
    });
  }
};

const scoreEventListener = (element, comment, user) => {
  const score = element.querySelector("#score");

  // INCREMENT SCORE
  const increment = element.querySelector("#increment-button");
  increment.addEventListener("click", () => {
    score.innerHTML = comment.updateScore(user.username, 1);
    localStorage.setItem("comments", JSON.stringify(comments));
  });

  // DESCREMENT SCORE
  const decrement = element.querySelector("#decrement-button");
  decrement.addEventListener("click", () => {
    score.innerHTML = comment.updateScore(user.username, -1);
    localStorage.setItem("comments", JSON.stringify(comments));
  });
};

const replyEventListener = (element, comment, user) => {
  const reply = element.querySelector("#reply-button");
  if (reply) {
    reply.addEventListener("click", () => {
      if (comment.replies.length) {
        // TOP LEVEL COMMENT
        if (element.parentElement.querySelector(".create-comment")) {
          // CLOSE TEXTFIELD
          element.parentElement.querySelector(".create-comment").remove();
        } else {
          // OPEN TEXTFIELD
          let div = displayTextField(
            "Reply",
            comment.id,
            comment.user.username,
            user
          );
          div.style.marginTop = "-0.5rem";
          element.after(div);
          e = div;
        }
      } else {
        // LOW LEVEL COMMENT
        if (
          element.nextElementSibling &&
          element.nextElementSibling.className === "create-comment"
        ) {
          // CLOSE TEXTFIELD
          element.nextElementSibling.remove();
        } else {
          // OPEN TEXTFIELD
          let div = displayTextField(
            "Reply",
            comment.id,
            comment.user.username,
            user
          );
          div.style.marginTop = "-0.5rem";
          element.after(div);
          e = div;
        }
      }
    });
  }
};

const updateEventListener = (element, comment) => {
  const update = element.querySelector("#update-button");
  const input = element.querySelector("#update-input");
  update.addEventListener("click", (event) => {
    event.preventDefault();
    let content = input.value;
    if (content.startsWith(`@${comment.replyingTo} `)) {
      content = content.substring(`@${comment.replyingTo} `.length);
    }
    let paragraph = document.createElement("p");
    paragraph.innerHTML = `<p>
    ${
      comment.replyingTo
        ? `<span class="reply-to">@${comment.replyingTo}</span>`
        : ""
    } ${content}
  </p>`;
    comment.updateContent(content);
    localStorage.setItem("comments", JSON.stringify(comments));
    element.replaceWith(paragraph);
  });
};

const editEventListener = (element, comment) => {
  const edit = element.querySelector("#edit-button");
  if (edit) {
    edit.addEventListener("click", () => {
      if (element.querySelector(".comment-content > p")) {
        let form = document.createElement("form");
        form.className = "comment-update";
        form.innerHTML = `
      <textarea name="update" id="update-input" cols="30" rows="4">${
        comment.replyingTo ? `@${comment.replyingTo}` : ""
      } ${comment.content}</textarea>
      <button type="submit" id="update-button">Update</button>
      `;
        updateEventListener(form, comment);
        element.querySelector(".comment-content > p").replaceWith(form);
      }
    });
  }
};

const deleteEventListener = (element) => {
  const del = element.querySelector("#delete-button");
  del.addEventListener("click", () => {
    e = element;
    const popupContainer = document.querySelector(".delete-pop-up-container");
    popupContainer.firstElementChild.style.marginTop =
      element.offsetTop - 50 + "px";
    window.scroll({
      left: 0,
      top: element.offsetTop - 200,
    });
    popupContainer.classList.add("show");
  });
};

const createCommentElement = (commentData, user) => {
  const commentElement = createCommentHTML(commentData, user);
  attachCommentEventListeners(commentElement, commentData, user);
  return commentElement;
};

const attachCommentEventListeners = (commentElement, comment, user) => {
  scoreEventListener(commentElement, comment, user);
  replyEventListener(commentElement, comment, user);
  editEventListener(commentElement, comment);
  deleteEventListener(commentElement);
};

const attachTextFieldEventListeners = (textFieldElement, id, to, user) => {
  sendEventListener(textFieldElement, user);
  confirmReplyEventListener(textFieldElement, id, to, user);
};

const displayComment = (comment, user) => {
  let div = document.createElement("div");
  div.className = "disc";

  let element = createCommentElement(comment, user);

  div.appendChild(element);

  if (comment.replies.length) {
    let section = document.createElement("section");
    section.className = "replies";
    comment.replies.forEach((reply) => {
      let result = createCommentElement(reply, user);
      div.appendChild(result);

      section.appendChild(result);
    });
    div.appendChild(section);
  }
  return div;
};

const displayTextField = (text, id, to, user) => {
  let div = document.createElement("div");
  div.className = "create-comment";
  div.appendChild(createTextFieldHTML(user, text, to));
  attachTextFieldEventListeners(div, id, to, user);
  return div;
};

// LOGIC
let currentUser;
let comments;
(async () => {
  try {
    const result = await fetchDATA();
    currentUser = result["user"];
    comments = orderCommentsByScore(result["comments"]);
    const main = document.querySelector("main");
    comments.forEach((comment) => {
      main.appendChild(displayComment(comment, currentUser));
    });
    main.appendChild(
      displayTextField("Send", undefined, undefined, currentUser)
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
})();

// DELETE POPUP BEHAVIOR
const popupContainer = document.querySelector(".delete-pop-up-container");
let e;
// CANCEL DELETE
const cancel = document.querySelector("#cancel-button");
cancel.addEventListener("click", () => {
  popupContainer.classList.remove("show");
});

// CONFIRM DELETE
const confirm = document.querySelector("#confirm-delete-button");
confirm.addEventListener("click", (event) => {
  const topLevelCommentIndex = comments.findIndex((item) => item.id === e.id);
  if (topLevelCommentIndex !== -1) {
    // TOP LEVEL COMMENT
    comments.splice(topLevelCommentIndex, 1);
    localStorage.setItem("comments", JSON.stringify(comments));
    e.parentElement.remove();
  } else {
    // LOW LEVEL COMMENT
    comments.forEach((item, index) => {
      if (item.replies) {
        const replyIndex = item.replies.findIndex((reply) => {
          return reply.id.toString() === e.id;
        });
        if (replyIndex !== -1) {
          item.replies.splice(replyIndex, 1);
        }
      }
    });
    localStorage.setItem("comments", JSON.stringify(comments));
    const topLevelCommentIndex = comments.findIndex(
      (item) => item.id === e.parentElement.previousElementSibling.id
    );
    if (!comments[topLevelCommentIndex].replies.length) {
      e.parentElement.remove();
    } else {
      e.remove();
    }
  }

  popupContainer.classList.remove("show");
});
