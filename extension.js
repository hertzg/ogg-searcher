
const Main = imports.ui.main;
const Search = imports.ui.search;
const gIO = imports.gi.Gio;
const gLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Util = imports.misc.util;


function OGGSearchProvider() {
	this._init();
}

var proto = Object.create(null);
OGGSearchProvider.prototype = proto;


proto._init = function(name) {
	Searc.SearchProvider.prototype._init.call(this, 'OGG');
}


function init(meta) {
	log('INIT', arguments);
}

function enable() {
	log('ENABLE', arguments);
}

function disable() {
	log('DISABLE', arguments);
}

