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
	
	var scrollAction = {};
	
	function snapToViewport(targetViewport)
	{
		if (obj.scrollLock) return;				
		obj.scrollLock = true;
		
		scrollAction.currentY = getScrollData().y;
		scrollAction.targetViewport = targetViewport;		
		scrollAction.animateId = requestAnimationFrame(easedScroll2);
	}
	
	function easedScroll2()
	{
		var currentY = scrollAction.currentY;
		var targetViewport = scrollAction.targetViewport;
		var targetY = Math.floor(obj.viewportSize * targetViewport);
		
		// how far away are we from the target?
		var diff = Math.floor(targetY - currentY);
		
		// determine the step size
		var stepSize = Math.floor(Math.abs(diff / 10));
		// if we're within ten of the target, set stepSize to 1
		if (Math.abs(diff) < 10) stepSize = 1;

		// a negative diff means we want to scroll up, 
		// so subtract stepSize from currentY to get the new currentY
		var newY = null;
		if (diff < 0)
		{
			newY = currentY - stepSize;
		}				
		// a positive diff means we want to scroll down, 
		// so add stepSize to currentY to get the new currentY
		else if (diff > 0)
		{
			newY = currentY + stepSize;
		}
		// exactly at zero, so update our location and stop
		else 
		{
			//console.log("done: " + diff + "... targetY = " + targetY + " and currentY = " + currentY);
			cancelAnimationFrame(scrollAction.animateId);
			//console.log(scrollAction);
			scrollAction = {};
			
			obj.currentViewport = targetViewport;
			obj.scrollLock = false;
			return;
		}
		
		// actually scroll
		window.scrollTo(0, newY);
		scrollAction.currentY = newY;
		
		scrollAction.animateId = requestAnimationFrame(easedScroll2);
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
	
	function resizeHandler()
	{
		getHeights();
		start();
	}
	
	function bind()
	{
		window.addEventListener("scroll", scrollHandler);
		window.addEventListener("resize", resizeHandler);
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
		animateViewport(obj.currentViewport);
		snapToViewport(obj.currentViewport);
	}
	
	function init()
	{	
		getHeights();
		start();
		bind();
	}
	
	init();
	
})(this);