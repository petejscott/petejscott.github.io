'use strict'
; (function(window) 
{
	var obj = {};
	obj.snappableElements = [];
	obj.snapPositions = [];
	obj.currentViewport = null;
	obj.scrollLock = false;
	
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
		var targetY = obj.snapPositions[targetViewport];
		
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
		var easingFactor = 0.15;
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
		calculateSnapPositions();
		start();
	}
	
	function bind()
	{
		window.addEventListener("scroll", scrollHandler);
		window.addEventListener("resize", resizeHandler);
	}
	
	function getCurrentViewport()
	{
		var currentY = getScrollData().y;
		var viewportHeight = window.innerHeight;
		var viewportCenter = currentY + (viewportHeight / 2);
		
		// Find which section we're currently in based on viewport center
		for (var i = obj.snapPositions.length - 1; i >= 0; i--) {
			// If the viewport center is past this snap position, we're in this section or later
			if (viewportCenter >= obj.snapPositions[i]) {
				// Check if we're closer to the next section
				if (i < obj.snapPositions.length - 1) {
					var distanceToThis = Math.abs(currentY - obj.snapPositions[i]);
					var distanceToNext = Math.abs(currentY - obj.snapPositions[i + 1]);
					
					// Only snap to next if we're significantly closer to it (past 40% of the way)
					var threshold = viewportHeight * 0.4;
					if (currentY > obj.snapPositions[i] + threshold && distanceToNext < distanceToThis) {
						return i + 1;
					}
				}
				return i;
			}
		}
		
		return 0;
	}
	
	function calculateSnapPositions()
	{
		obj.snappableElements = document.querySelectorAll('.snappable');
		obj.snapPositions = [];
		
		for (var i = 0; i < obj.snappableElements.length; i++) {
			var element = obj.snappableElements[i];
			var rect = element.getBoundingClientRect();
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			var position = rect.top + scrollTop;
			obj.snapPositions.push(position);
		}
		
		// Update current viewport after recalculation
		var previousViewport = obj.currentViewport;
		obj.currentViewport = getCurrentViewport();
		
		// If we're not at the same viewport after recalculation, don't auto-snap
		// This prevents jumping when content dynamically loads
		if (previousViewport !== null && previousViewport === obj.currentViewport) {
			// We're still in the same section, don't snap
		}
	}
	
	function start()
	{
		animateViewport(obj.currentViewport);
		snapToViewport(obj.currentViewport);
	}
	
	function init()
	{	
		calculateSnapPositions();
		start();
		bind();
	}
	
	// Expose recalculate function for external use (e.g., after dynamic content loads)
	window.scrollSnapRecalculate = function() {
		calculateSnapPositions();
	};
	
	init();
	
})(this);