export function normalize_path(path) {
  // this logic was added by Steve for the specific hugo structure of our dev docs
  // are you sure we want this? 
  // we should not assume one is using hugo/any site generator
  // we should just explain how to serve the file tree as their corresponding public paths 
  // strip first slash
  path = path.replace(/^\/+/, '')
  // root page
  if (path == '') {
    return 'index.html'
    // directory page with a trailing /
  } else if (path.endsWith('/')) {
    return path + 'index.html'
    // normal path, no need to do anything!
  } else {
    return path
  }
}

export function is_directory(path) {
  const bits = path.split('/')
  const last = bits[bits.length - 1]

  // does the final component contain a dot? technically there may be edge cases
  // here but this is fine for now!
  return !last.includes('.')
}
