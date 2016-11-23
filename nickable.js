(function(){
	var Nickable = function( area_id, opts ){
		this.area = document.querySelectorAll( area_id );
		this.opts = opts;
		this.opts.mobile = !!('ontouchstart' in window);
		console.log( this.opts.mobile );
		this.events = {};
		this.events.mdown = this.opts.mobile? 'touchstart' : 'mousedown';
		this.events.mmove = this.opts.mobile? 'touchmove' : 'mousemove';
		this.events.mup = this.opts.mobile? 'touchend' : 'mouseup';

		if( opts.allow ){
			this.nicks = document.querySelectorAll( opts.allow );
		}
		return this;
	}

	Nickable.prototype.init = function(){
		this.add_events();
	}

	Nickable.prototype.destroy = function(){

	}
	Nickable.prototype.mdown = function( e ){
		var el = e.target;

		this.woff = el.getClientRects()[0];
		
		var cx = this.opts.mobile? (e.changedTouches[0].pageX - this.woff.left) : e.offsetX;
		var cy = this.opts.mobile? (e.changedTouches[0].pageY - this.woff.top) : e.offsetY;
		

		this.mousepos = {x: cx, y: cy };
		this.woff = {x: this.woff.left, y: this.woff.top };
		this.nickpos = {x: el.offsetLeft, y: el.offsetTop };
		this.original_parent = el.parentNode;
		console.log( cx,cy );

		el.parentNode.removeChild(el);
		el.style.position = 'fixed';
		el.style.left = this.woff.x+'px';
		el.style.top = this.woff.y+'px';
		el.style.zIndex = '99999';

		document.body.appendChild( el );
		this.drag_obj = el;

		this.mmove_bind = this.mmove.bind(this);
		window.addEventListener( this.events.mmove, this.mmove_bind, false );
	}
	Nickable.prototype.mup = function( e ){
		window.removeEventListener( this.events.mmove, this.mmove_bind, false );

		if( this.drag_obj ==  e.target ){
			this.check_drops();	
		}
	}
	Nickable.prototype.mmove = function( e ){
		var cx = this.opts.mobile? e.changedTouches[0].clientX : e.clientX;
		var cy = this.opts.mobile? e.changedTouches[0].clientY : e.clientY;
		//console.log( this );
		this.drag_obj.style.left = cx-this.mousepos.x+'px';
		this.drag_obj.style.top = cy-this.mousepos.y+'px';
	}
	Nickable.prototype.add_events = function(){
		var ref = this;
		ref.mup_bind = this.mup.bind(this);
		ref.mdown_bind = this.mdown.bind(this);
		if( this.nicks.length ){
			this.nicks.forEach( function( el, index ){
				el.addEventListener( ref.events.mdown, ref.mdown_bind, false );
			});
		}
		window.addEventListener( ref.events.mup, ref.mup_bind, false );
	}
	Nickable.prototype.check_drops = function(){
		var obj = this.drag_obj.getClientRects()[0];
		obj.left = obj.left-this.mousepos.x;
		obj.top = obj.top-this.mousepos.y;
		var drag = this.drag_obj;
		var found = false;
		var ref = this;

		this.area.forEach( function( el, idx ){
			var area = el.getClientRects()[0];
			if( Utils.contains( obj, area ) && (area.width > obj.width) && (area.height > obj.height) ){
				drag.parentNode.removeChild( drag );

				el.appendChild( drag );
				drag.style.position = '';
				if( ref.opts.maintain_position ){
					drag.style.left = obj.left - area.left + 'px';
					drag.style.top = obj.top - area.top + 'px';
				} else {
					drag.style.left = '';
					drag.style.top = '';
				}
				drag.removeEventListener( ref.events.mdown, ref.mdown_bind, false );
				ref.drag_obj = null;
				//window.removeEventListener('mouseup', ref.mup_bind, false );

				drag.style.zIndex = '';

				found = true;
			}
		});
		if( !found ){
			drag.parentNode.removeChild( drag );
			drag.style.position = '';
			var old = this.original_parent.getClientRects()[0];
			drag.style.left = obj.left-old.left + 'px';
			drag.style.top = obj.top-old.top + 'px';

			this.original_parent.appendChild( drag );

			drag.style.webkitTransition = 'all 0.4s linear';
			
			setTimeout( function(){
				drag.style.left = '';
				drag.style.top = '';
			}, 10 );
			setTimeout( function(){
				drag.style.webkitTransition = '';
				drag.style.zIndex = '';
			}, 500 );

		}
	}

	var Utils = {
		distance: function( a, b ){
			if(!b.x) b.x=0; 
			if(!b.y) b.y=0;
			return Math.sqrt((b.x-a.x)*(b.x-a.x)+(b.y-a.y)*(b.y-a.y)); 
		},
		contains: function( el1, el2 ){
			return ( el1.left >= el2.left && el1.left <= el2.right && el1.top >= el2.top && el1.top <= el2.bottom );
		}
	}

	window.Nickable = Nickable;	
})();