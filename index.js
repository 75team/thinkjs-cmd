var fs = require('fs');
var child_process = require('child_process');
var os = require('os');
var path = require('path');

require('thinkjs/lib/Common/common.js');

var argv = process.argv;
if (argv.indexOf('-h') > -1) {
  console.log('Usage: thinkjs projectpath');
}else if (argv.indexOf('-v') > -1) {
  var version = getVersion();
  console.log(version);
}else{
  createProject();
}

/**
 * 获取目录下的所有文件
 * @param  {[type]} dir    [description]
 * @param  {[type]} prefix [description]
 * @return {[type]}        [description]
 */
function getFiles(dir, prefix){
  if (!fs.existsSync(dir)) {
    return [];
  }
  prefix = prefix || '';
  var files = fs.readdirSync(dir);
  var result = [];
  files.forEach(function(item){
    var stat = fs.statSync(dir + '/' + item);
    if (stat.isFile()) {
      result.push(prefix + item);
    }else if(stat.isDirectory()){
      result = result.concat(getFiles(path.normalize(dir + '/' + item),  path.normalize(prefix + '/' + item + '/')));
    }
  })
  return result;
}
/**
 * 获取版本号
 * @return {[type]} [description]
 */
function getVersion(){
  var argv = process.argv[2];
  if (argv) {
    var packageFile = argv + '/node_modules/thinkjs/package.json';
    if (isFile(packageFile)) {
      var content = fs.readFileSync(packageFile);
      content = JSON.parse(content);
      return content.version;
    }
  };
  var packageFile = __dirname + '/node_modules/thinkjs/package.json';
  var content = fs.readFileSync(packageFile);
  content = JSON.parse(content);
  return content.version;
}
/**
 * 创建项目
 * @return {[type]} [description]
 */
function createProject(){
  var projectpath = argv[2];
  if (!projectpath) {
    projectpath = '.';
  }
  mkdir(projectpath, '0755');
  var excudePath = ['.git', '.svn', 'node_modules'];
  var files = fs.readdirSync(projectpath).filter(function(item){
    if (excudePath.indexOf(item) > -1) {
      return;
    }
    return item;
  });
  if (files.length) {
    console.log('path `' + projectpath + '` is not empty');
    return false;
  }
  mkpath(projectpath);
  copyFiles(projectpath);
  console.log('Application create finished');
  copyThinkJS(projectpath);
  startService(projectpath);
}

/**
 * 创建项目目录
 * @param  {[type]} projectpath [description]
 * @return {[type]}             [description]
 */
function mkpath(projectpath){
  var paths = [
    '/www/resource/',
    '/www/resource/js',
    '/www/resource/css',
    '/www/resource/module',
    '/www/resource/swf',
    '/www/resource/font',
    '/www/resource/img',
    '/www/resource/other',
    '/App/Lib/Model',
    '/App/Lib/Controller/Home',
    '/App/Common',
    '/App/Conf',
    '/App/Runtime/Cache',
    '/App/Runtime/Data',
    '/App/Runtime/Temp',
    '/App/Runtime/Log',
    '/App/View'
  ];
  paths.forEach(function(item){
    mkdir(projectpath + item, '0755');
  });
}
/**
 * 拷贝文件
 * @return {[type]} [description]
 */
function copyFiles(projectpath){
  var prefixPath = __dirname + '/tmp';
  var sourceFiles = [
    prefixPath + '/IndexController.js',
    prefixPath + '/BaseController.js',
    prefixPath + '/index_index.html',
    prefixPath + '/common.js',
    prefixPath + '/ctrl.sh',
    prefixPath + '/config.js',
    prefixPath + '/index.js',
    prefixPath + '/gitignore.log',
    prefixPath + '/package.json',
    prefixPath + '/README.md'
  ];
  var dstFiles = [
    '/App/Lib/Controller/Home/IndexController.js',
    '/App/Lib/Controller/Home/BaseController.js',
    '/App/View/Home/index_index.html',
    '/App/Common/common.js',
    '/ctrl.sh',
    '/App/Conf/config.js',
    '/www/index.js',
    '/.gitignore',
    '/package.json',
    '/README.md'
  ];
  dstFiles.forEach(function(file, i) {
    file = projectpath + file;
    if (!isFile(file)) {
      mkdir(path.dirname(file), '0755');
      var buffer = fs.readFileSync(path.normalize(sourceFiles[i]));
      fs.writeFileSync(path.normalize(file), buffer);
    }
  });
}
/**
 * 拷贝thinkjs目录
 * @param  {[type]} projectpath [description]
 * @return {[type]}             [description]
 */
function copyThinkJS(projectpath){
  var thinkjsPath = __dirname + '/node_modules/thinkjs/';
  var targetPath = path.normalize(projectpath + '/node_modules/thinkjs/');
  if (isDir(targetPath)) {
    return;
  };
  var files = getFiles(thinkjsPath);
  files.forEach(function(file){
    var sourceFile = thinkjsPath + file;
    var targetFile = path.normalize(targetPath + '/' + file);
    mkdir(path.dirname(targetFile), '0755');
    var buffer = fs.readFileSync(sourceFile);
    fs.writeFileSync(targetFile, buffer);
  })
}
/**
 * 启动服务
 * @param  {[type]} projectpath [description]
 * @return {[type]}             [description]
 */
function startService(projectpath){
  var nodePath = process.execPath;
  child_process.exec('"' + nodePath + '" ' + path.normalize(projectpath + '/www/index.js'));
  //打开浏览器
  var exec = 'open';
  if (os.platform() === 'win32') {
    exec = 'start';
  }
  setTimeout(function(){
    child_process.exec(exec + ' http://127.0.0.1:8360');
  }, 1000);
}