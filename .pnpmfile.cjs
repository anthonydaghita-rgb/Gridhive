// Allow all build scripts
function readPackage(pkg, context) {
  return pkg
}

module.exports = { hooks: { readPackage } }
