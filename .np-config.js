const config = {
  // anyBranch - Allow publishing from any branch (false by default).
  cleanup: false, // cleanup - Cleanup node_modules (true by default).
  tests: false, // tests - Run npm test (true by default).
  // yolo - Skip cleanup and testing (false by default).
  publish: false, // publish - Publish (true by default).
  // preview - Show tasks without actually executing them (false by default).
  // tag - Publish under a given dist-tag (latest by default).
  yarn: false, // yarn - Use yarn if possible (true by default).
  // contents - Subdirectory to publish (. by default).
  // releaseDraft - Open a GitHub release draft after releasing (true by default).
};

module.exports = exports = config;
