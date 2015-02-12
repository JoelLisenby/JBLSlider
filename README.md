# JBLSlider
A light weight responsive jQuery slider

Unique features
---------------
* Fixed height

Usage example
-----

Demo http://www.joellisenby.com/jblslider/

```
<script src="js/jquery-1.11.2.min.js"></script>
<script src="js/jquery.jblSlider.js"></script>

<div class="slider" id="jblslider">
<div class="slide" style="background-image: url('images/slide1.jpg')">
<span>Slide 1 Phrase</span>
</div>
<div class="slide" style="background-image: url('images/slide2.jpg')">
<span>Slide 2 Phrase</span>
</div>
<div class="slide" style="background-image: url('images/slide3.jpg')">
<span>Slide 3 Phrase</span>
</div>
<div class="slide" style="background-image: url('images/slide4.jpg')">
<span>Slide 4 Phrase</span>
</div>
</div>

<script>
$("#jblslider").jblSlider({
	element: '.jblslider',
	height: 300,
	duration: 500,
	delay: 5000
});
</script>
```