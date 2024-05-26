exports.getAllUsers = (request, response) => {
  response.status(500).json({
    status: "success",
    message: "Reponse from get all users",
  });
};

exports.createUser = (request, response) => {
  response.status(500).json({
    status: "success",
    message: "Reponse to create users",
  });
};

exports.getUser = (request, response) => {
  response.status(500).json({
    status: "success",
    message: "Reponse from get user",
  });
};
