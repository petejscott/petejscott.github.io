'use strict'
; (function(window) 
{
	var obj = {};
	obj.snappableElements = [];
	obj.snapPositions = [];
	obj.sectionHeights = [];
	obj.currentViewport = null;
	obj.scrollLock = false;
	var lastScrollY = 0;
	
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
	
	function isWithinSection(sectionIndex, scrollY)
	{
		var viewportHeight = window.innerHeight;
		var sectionStart = obj.snapPositions[sectionIndex];
		var sectionEnd = (sectionIndex < obj.snapPositions.length - 1) 
			? obj.snapPositions[sectionIndex + 1] 
			: document.documentElement.scrollHeight;
		
		// Check if we're well within the section (not at the edges)
		var distanceFromTop = scrollY - sectionStart;
		var distanceFromBottom = sectionEnd - scrollY - viewportHeight;
		
		// If we're more than 30% of viewport away from both edges, we're "within" the section
		var edgeThreshold = viewportHeight * 0.3;
		return distanceFromTop > edgeThreshold && distanceFromBottom > edgeThreshold;
	}
	
	function shouldSnapSection(sectionIndex)
	{
		// Don't snap if the section is significantly taller than viewport
		var viewportHeight = window.innerHeight;
		var sectionHeight = obj.sectionHeights[sectionIndex];
		
		// If section is more than 1.5x viewport height, disable snapping while within it
		return sectionHeight <= viewportHeight * 1.5;
	}
	
	function scrollHandler(evt)
	{
		var currentY = getScrollData().y;
		var currentSection = getCurrentViewport();
		
		// Check if we're within a tall section
		if (!shouldSnapSection(currentSection) && isWithinSection(currentSection, currentY)) {
			// Don't snap while actively scrolling within a tall section
			obj.currentViewport = currentSection;
			animateViewport(currentSection);
			lastScrollY = currentY;
			return;
		}
		
		// Snap immediately if changing sections
		var targetViewport = getCurrentViewport();
		if (targetViewport !== obj.currentViewport) 
		{
			snapToViewport(targetViewport);
			animateViewport(targetViewport);
		}
		lastScrollY = currentY;
		
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
		var viewportBottom = currentY + viewportHeight;
		
		// Find which section we're currently in
		// We require at least 50% of the next section to be visible before snapping to it
		for (var i = obj.snapPositions.length - 1; i >= 0; i--) {
			var sectionStart = obj.snapPositions[i];
			
			// Check if the next section is at least 50% visible
			if (i < obj.snapPositions.length - 1) {
				var nextSectionStart = obj.snapPositions[i + 1];
				var nextSectionVisible = viewportBottom - nextSectionStart;
				
				// If next section is more than 50% visible, snap to it
				if (nextSectionVisible > viewportHeight * 0.5) {
					return i + 1;
				}
			}
			
			// If current section start is above or at current scroll position
			if (sectionStart <= currentY) {
				return i;
			}
		}
		
		return 0;
	}
	
	function calculateSnapPositions()
	{
		obj.snappableElements = document.querySelectorAll('.snappable');
		obj.snapPositions = [];
		obj.sectionHeights = [];
		
		for (var i = 0; i < obj.snappableElements.length; i++) {
			var element = obj.snappableElements[i];
			var rect = element.getBoundingClientRect();
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			var position = rect.top + scrollTop;
			obj.snapPositions.push(position);
			obj.sectionHeights.push(rect.height);
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