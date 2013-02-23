const Main = imports.ui.main;
const Search = imports.ui.search;
const gIO = imports.gi.Gio;
const gLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Util = imports.misc.util;
const Lang = imports.lang;
const Soup = imports.gi.Soup;

var _sess = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_sess, new Soup.ProxyResolverDefault());

var dbg = function() {
	let arr = Array.prototype.slice.call(arguments);
	let str = new Date().toString()+": ";		
	arr.forEach(function(v, i) {
		str += " ";
		try {
			str += JSON.stringify(v, undefined, 2);
		} catch(e) {
			global.log('ERR:' +e);
			str += v+'';
		}
	});
	
	global.log(str);
}

function toArr(o) {
	return Array.prototype.slice.call(o);
}





let appSys = Shell.AppSystem.get_default();
let tmpApp = appSys.lookup_app('Eclipse.desktop');


let timeoutInt = null;
const OGGSearchProvider = new Lang.Class({
	Name: 'OGGSearchProvider',
	Extends: Search.SearchProvider,
	
	
	_init: function() {
		this.parent("OGG.GE");
		this.async = true;
	},
	
	getResultMetas: function(ids) {
		dbg('getResultMetas');
		
		let metas = [];
		let that = this;
		ids.forEach(function(id) {
		
			metas.push({
				id: id,
				name: that.data[id].songName,
				createIcon: function(size) {
					return tmpApp.create_icon_texture(size);
				}
			});
		
		});
		
		return metas;
		//cb(this.getResultMetas(ids));
	},
	
	getResultMetasAsync: function(ids, cb) {
		let metas = [];
		let that = this;
		
		dbg('getResultMetasAsync', ids);
		
		ids.forEach(function(id) {
		
			metas.push({
				id: id,
				name: that.data[id].songName,
				createIcon: function(size) {
					return tmpApp.create_icon_texture(size);
				}
			});
		
		});
		
		dbg('metas', metas);
		cb(metas);
		
		//return metas;
	},
	
	getInitialResultSetAsync: function(terms) {
		dbg('getInitialResultSetAsync');
		this.searchHandler(terms, null);
	},
	
	getSubsearchResultSetAsync: function(prevTerms, terms) {
		dbg('getSubsearchResultSetAsync');
		this.searchHandler(terms, prevTerms);
	},
	
	_makeReq: function(keywords, cb) {
		
		if(timeoutInt) {
			Main.Mainloop.source_remove(timeoutInt);
			timeoutInt = null;
		}
		
		timeoutInt = Main.Mainloop.timeout_add(1000, function(){
			
			dbg('TIMEOUT TICK!!!!', keywords);
			
			let url = "http://ogg.ge/api/search.php?keyword="+encodeURIComponent(keywords);
		
			var req = Soup.Message.new('GET', url);
			req.connect('got_headers', function(mess){
				//dbg('got_headers', mess);
				//dbg('got_headers', mess.response_headers);	
			});
		
			req.connect('got_chunk', function(mess, chunk) {
				//dbg('got_chunk', chunk.length);
			});
		
			_sess.queue_message(req, function(sess, mess) {
				dbg('done');
				
				//dbg();
				cb(mess.response_body.data);
			});
			
			return false;
		});
	},
	
	searchHandler: function(terms, prevTerms) {
		//dbg('terms!!!!!!!!!!!!!!!!!!!!!!!!!!!!111 -> ', terms.join('asd'));
		var that = this;
		
		let keywords = terms.join(' ');
		this._makeReq(keywords, function(res) {
			let obj = null;
			try {
				obj = JSON.parse(res);
			} catch (e) {
				log("CANT PARSE!!!!!!!", res);
				return;
			}
			
			that.data = Object.create(null);
			let ids = [];
			obj.songs.forEach(function(o){
				ids.push(o.id);
				that.data[o.id] = o;
			});			

			dbg(ids);

			that.searchSystem.pushResults(that, ids);
		})
		
			
		//return ["test"];
	},
	
	activateResult: function(id, params) {
		let url = "http://ogg.ge/song.php?id=" + id;
		try {
            Gio.app_info_launch_default_for_uri(url, global.create_app_launch_context());
        } catch (e) {
            // TODO: remove this after glib will be removed from moduleset
            // In the default jhbuild, gio is in our prefix but gvfs is not
            Util.spawn(['gvfs-open', url])
        }

        Main.overview.hide();
	}
	
	/*activateResult: function(){
	
	},
	
	createResultActor: function() {
		return tmpApp.create_icon_texture(size);
	}*/
	
	
});


let provider = null;

function init(meta) {
	//log(JSON.stringify("asd"));
	//dbg('init()', toArr(arguments));
}

function enable() {
	//dbg('enable()', toArr(arguments));
	provider =  new OGGSearchProvider();
	Main.overview.addSearchProvider(provider);
}

function disable() {
	//dbg('disable()', toArr(arguments));
	if(provider != null) {
		Main.overview.removeSearchProvider(provider);
		provider = null;
	}
}

