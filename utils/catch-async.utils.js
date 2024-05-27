module.exports = (asyncFunction) => (request, response, next) => {
  asyncFunction(request, response, next).catch(next);
};
