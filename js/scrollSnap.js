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
		scrollAction.animateId = requestAnimationFrame(easedScroll);
	}
	
	function easedScroll()
	{
		var currentY = scrollAction.currentY;
		var targetViewport = scrollAction.targetViewport;
		var targetY = obj.viewportSize * targetViewport;
		
		var diff = targetY - currentY;
		var absDiff = Math.abs(diff);
		
		// Use a threshold to prevent infinite loops from floating-point precision
		if (absDiff < 1) {
			// Snap exactly to target and stop
			window.scrollTo(0, targetY);
			cancelAnimationFrame(scrollAction.animateId);
			scrollAction = {};
			obj.currentViewport = targetViewport;
			obj.scrollLock = false;
			return;
		}
		
		// Configurable easing factor (0.1 = gentle, 0.2 = faster)
		var easingFactor = 0.1;
		var stepSize = Math.max(1, absDiff * easingFactor);
		
		var newY = currentY + (diff > 0 ? stepSize : -stepSize);
		
		// actually scroll
		window.scrollTo(0, newY);
		scrollAction.currentY = newY;
		
		scrollAction.animateId = requestAnimationFrame(easedScroll);
	}
	
	function animateViewport(targetViewport)
	{
		var body = document.querySelector("body");
		var colorClasses = ["blue", "yellow", "green", "bluegreen"];
		
		colorClasses.forEach(function(colorClass) {
			body.classList.remove(colorClass);
		});
		
		if (targetViewport >= 0) {
			var colorIndex = targetViewport % colorClasses.length;
			body.classList.add(colorClasses[colorIndex]);
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