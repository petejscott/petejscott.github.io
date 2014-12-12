'use strict'
; (function(window) 
{
	var obj = {};
	obj.viewportSize = 0;
	obj.documentSize = 0;
	obj.numViewports = 0;
	obj.currentViewport = null;
	obj.scrollLock = false;
	
	function getDocumentSize()
	{
		return Math.max(
			document.documentElement.clientHeight,
			document.documentElement.offsetHeight,
			document.documentElement.scrollHeight);
	}
	
	function getScrollData()
	{
		var top  = window.pageYOffset || document.documentElement.scrollTop;
		var left = window.pageXOffset || document.documentElement.scrollLeft;
		return { 'x' : left, 'y' : top };
	}
	
	function snapToViewport(targetViewport)
	{
		easedScroll(getScrollData().y,  targetViewport);		
	}
	
	function easedScroll(currentY, targetViewport)
	{
		if (obj.scrollLock) return;				
		obj.scrollLock = true;
		
		currentY = Math.floor(currentY);
		var targetY = Math.floor(obj.viewportSize * targetViewport);
		
		// how far away are we from the target?
		var diff = Math.floor(targetY - currentY);
		
		// determine the step size
		var stepSize = Math.floor(Math.abs(diff / 10));
		// if we're within ten of the target, set stepSize to 1
		if (Math.abs(diff) < 10) stepSize = 1;

		// a negative diff means we want to scroll up, 
		// so subtract stepSize from currentY to get the new currentY
		if (diff < 0)
		{
			currentY = currentY - stepSize;
		}				
		// a positive diff means we want to scroll down, 
		// so add stepSize to currentY to get the new currentY
		else if (diff > 0)
		{
			currentY = currentY + stepSize;
		}
		// exactly at zero, so update our location and stop
		else 
		{
			obj.currentViewport = targetViewport;
			obj.scrollLock = false;
			return;
		}
		
		// actually scroll
		window.scrollTo(0, currentY);
		// and set a 1-tick timeout to recurse
		window.setTimeout(function() {
			obj.scrollLock = false;
			easedScroll(currentY, targetViewport);
		}, 1);
	}
	
	function animateViewport(targetViewport)
	{
		var body = document.querySelector("body");
		body.classList.remove("green");
		body.classList.remove("blue");
		body.classList.remove("bluegreen");
		
		if (targetViewport === 0)
		{
			document.querySelector("body").classList.add("blue");
		}
		else if (targetViewport === 1)
		{
			document.querySelector("body").classList.add("green");
		}
		else if (targetViewport === 2)
		{			
			document.querySelector("body").classList.add("bluegreen");
		}
	}
	
	function scrollHandler(evt)
	{
		var targetViewport = getCurrentViewport();
		
		if (targetViewport !== obj.currentViewport) 
		{
			snapToViewport(targetViewport);
			animateViewport(targetViewport);
		}
		evt.preventDefault();
	}
	
	function bind()
	{
		window.addEventListener("scroll", scrollHandler);
		window.addEventListener("resize", start);
	}
	
	function getCurrentViewport()
	{
		var currentPos = getScrollData();
		return Math.round(currentPos.y / obj.viewportSize);
	}
	
	function getHeights()
	{
		obj.viewportSize = window.innerHeight;
		obj.documentSize = getDocumentSize();
		obj.numViewports = Math.round(obj.documentSize / obj.viewportSize);	
		obj.currentViewport = getCurrentViewport();			
	}
	
	function start()
	{
		getHeights();
		animateViewport(obj.currentViewport);
		snapToViewport(obj.currentViewport);
	}
	function init()
	{
		start();
		bind();
	}
	
	init();
	
})(this);