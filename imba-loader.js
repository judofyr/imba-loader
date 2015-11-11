var compiler = require('imba/lib/compiler');
var parser = require('imba/lib/compiler/parser');
var util = require('imba/lib/compiler/helpers');
var ERR = require('imba/lib/compiler/errors');
var chalk = require('chalk');

function printCompilerError(e,pars) {
  function log(){
    var $0 = arguments, i = $0.length;
    var pars = new Array(i>0 ? i : 0);
    while(i>0) pars[i-1] = $0[--i];
    return console.log.apply(console,pars);
  };

  function ts(){
		var d = new Date().toISOString().substr(11,8);
		return chalk.dim(d);
	};

	function b(){
		var $0 = arguments, i = $0.length;
		var pars = new Array(i>0 ? i : 0);
		while(i>0) pars[i-1] = $0[--i];
		return chalk.bold.apply(chalk,pars);
	};

	function dim(){
		return chalk.dim;
	};

	function puts(str){
		return process.stdout.write(str);
	};

	function print(str){
		return process.stdout.write(str);
	};

  if(!pars||pars.constructor !== Object) pars = {};
  var source = pars.source !== undefined ? pars.source : null;
  var tok = pars.tok !== undefined ? pars.tok : null;
  var tokens = pars.tokens !== undefined ? pars.tokens : null;
  var lex = e.lexer;
  var file = pars.file;

  tok || (tok = lex && lex.yytext);
  tokens || (tokens = lex && lex.tokens);

  var src = source;
  var locmap = util.locationToLineColMap(src);
  var lines = src && src.split(/\n/g);

  var lnum = function(l,color) {
    if(color === undefined) color = 'grey';
    var s = String(l + 1);
    while (s.length < 6){
      s = ' ' + s;
    };
    return dim()[color]('    ' + s + '  ');
  };


  function printLn(nr,errtok){
    var tok, fmt;
    var pos = lex && lex.pos || 0;
    var ln = lines[nr];
    var prefix = lnum(nr,errtok ? ('red') : ('grey'));

    if (!ln) { return log(prefix) };

    var colors = {
      NUMBER: chalk.blue,
      STRING: chalk.green,
      KEYWORD: chalk.gray,
      PUNCTUATION: chalk.white,
      IDENTIFIER: chalk.bold,
      ERR: chalk.bold.red.underline
    };

    // first get the pos up to the wanted line
    while (tok = tokens[++pos]){
      var tloc = locmap[tok._loc];
      if (tloc && tloc[0] > nr) { break };
    };

    while (tok = tokens[--pos]){
      if (tok._loc == -1) { continue }; // generated

      var typ = tok._type;
      var loc = locmap[tok._loc];
      var col = loc && loc[1] || 0;
      var len = tok._len || tok._value.length;
      var l = loc[0];

      if (l > nr) { continue };
      if (l < nr) { break };

      if (typ.length > 1 && typ == tok._value.toUpperCase()) { typ = 'KEYWORD' };
      if (typ.match(/^[\[\]\{\}\(\)\,]/)) { typ = 'PUNCTUATION' };
      if (tok == errtok) {
        typ = 'ERR';
      };

      if (fmt = colors[typ]) {
        ln = ln.substr(0,col) + fmt(ln.substr(col,len)) + ln.slice(col + len);
      };
    };

    log(prefix + ln);

    return;
  };

  log(" - " + chalk.red(e.message)); // + character + c2

  if (tok && src) {
    // find the closest non-generated token to show error
    var tpos = tokens.indexOf(tok);
    while (tok && tok._loc == -1){
      tok = tokens[--tpos];
    };

    var lc = locmap[tok._loc] || [0,0];
    var ln = lc[0];
    var col = lc[1];

    log(" at " + chalk.blue(file + ":" + (ln + 1)))
    log(chalk.grey("    ------") + "  ------------------");
    printLn(ln - 3);
    printLn(ln - 2);
    printLn(ln - 1);
    printLn(ln,tok);
    printLn(ln + 1);
    log(chalk.grey("    ------") + "  ------------------");
  };
  return;
};

module.exports = function(content) {
  this.cacheable();

  var opts = {
  	sourceMap: this.sourceMap,
  	sourcePath: this.resourcePath
  };

  try {
    var tokens = compiler.tokenize(content, opts);
    var ast = parser.parse(tokens);
    var result = ast.compile(opts);
    var js = result.toString();
    this.callback(null, js, result.sourcemap);
  } catch (e) {
    if (e instanceof ERR.ImbaParseError) {
      try {
        var tok = e.start();
      } catch (e) {
        tok = null;
      };
      printCompilerError(e, {source: content, tok: tok, tokens: tokens, file: this.resourcePath});
      this.emitError(this.resourcePath + " failed to compile");
      this.callback(null, '');
    } else {
      throw e;
    };
  }
}
