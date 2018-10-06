const setGlobalVar = (name, value) => {
  global.aws_vars = {
    [name]: value,
    ...global.aws_vars
  }
}

module.exports = {
  setGlobalVar,
}