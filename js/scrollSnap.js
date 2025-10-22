'use strict'
; (function(window) 
{
	var obj = {};
	obj.sections = [];
	obj.activeSection = null;
	obj.scrollLock = false;
	
	function getScrollData()
	{
		var top  = window.pageYOffset || document.documentElement.scrollTop;
		var left = window.pageXOffset || document.documentElement.scrollLeft;
		return { 'x' : left, 'y' : top };
	}
	
	var scrollAction = {};
	
	function snapToSection(section)
	{
		if (obj.scrollLock) return;				
		obj.scrollLock = true;
		
		var rect = section.element.getBoundingClientRect();
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		var targetY = rect.top + scrollTop;
		
		scrollAction.currentY = getScrollData().y;
		scrollAction.targetY = targetY;
		scrollAction.targetSection = section;
		scrollAction.animateId = requestAnimationFrame(easedScroll);
	}
	
	function easedScroll()
	{
		var currentY = scrollAction.currentY;
		var targetY = scrollAction.targetY;
		
		var diff = targetY - currentY;
		var absDiff = Math.abs(diff);
		
		// Use a threshold to prevent infinite loops from floating-point precision
		if (absDiff < 1) {
			// Snap exactly to target and stop
			window.scrollTo(0, targetY);
			cancelAnimationFrame(scrollAction.animateId);
			obj.activeSection = scrollAction.targetSection;
			scrollAction = {};
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
	
	function animateSection(section)
	{
		var body = document.querySelector("body");
		var colorClasses = ["blue", "yellow", "green", "bluegreen"];
		
		colorClasses.forEach(function(colorClass) {
			body.classList.remove(colorClass);
		});
		
		if (section && section.index >= 0) {
			var colorIndex = section.index % colorClasses.length;
			body.classList.add(colorClasses[colorIndex]);
		}
	}
	
	function isHeaderInViewport(header)
	{
		var rect = header.getBoundingClientRect();
		var viewportHeight = window.innerHeight;
		
		// Check if header is in viewport (with some margin at top)
		return rect.top >= 0 && rect.top <= viewportHeight * 0.5;
	}
	
	function scrollHandler(evt)
	{
		if (obj.scrollLock) return;
		
		// Check each section's header
		for (var i = 0; i < obj.sections.length; i++) {
			var section = obj.sections[i];
			
			// Skip if this is already the active section
			if (obj.activeSection === section) {
				continue;
			}
			
			// Check if this section's header is entering the viewport
			if (isHeaderInViewport(section.header)) {
				obj.activeSection = section;
				snapToSection(section);
				animateSection(section);
				break;
			}
		}
		
		evt.preventDefault();
	}
	
	function resizeHandler()
	{
		cacheSections();
	}
	
	function bind()
	{
		window.addEventListener("scroll", scrollHandler);
		window.addEventListener("resize", resizeHandler);
	}
	
	function cacheSections()
	{
		obj.sections = [];
		var snappableElements = document.querySelectorAll('.snappable');
		
		for (var i = 0; i < snappableElements.length; i++) {
			var element = snappableElements[i];
			var header = element.querySelector('header');
			
			if (header) {
				obj.sections.push({
					element: element,
					header: header,
					index: i
				});
			}
		}
	}
	
	function init()
	{	
		cacheSections();
		
		// Set initial active section based on scroll position
		var currentY = getScrollData().y;
		for (var i = obj.sections.length - 1; i >= 0; i--) {
			var rect = obj.sections[i].element.getBoundingClientRect();
			var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			var sectionTop = rect.top + scrollTop;
			
			if (currentY >= sectionTop - 100) {
				obj.activeSection = obj.sections[i];
				animateSection(obj.activeSection);
				break;
			}
		}
		
		bind();
	}
	
	// Expose recalculate function for external use (e.g., after dynamic content loads)
	window.scrollSnapRecalculate = function() {
		cacheSections();
	};
	
	init();
	
})(this);