<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>teknine.com</title>
	<meta name="viewport" content="width=device-width; initial-scale=1.0">
	<link rel="stylesheet" href="style/teknine.css" type="text/css" />
</head>
<body>
	<header id="site-header" class="container">
		<hgroup>
			<h1><a href="/">teknine.com</a></h1>
		</hgroup>
		<nav>
			<a href="https://twitter.com/kyofu">Twitter</a>
			<a href="https://github.com/petejscott">GitHub</a>
		</nav>
	</header>
	<aside id="site-banner" class="banner">
		<div class="container">
		</div>
	</aside>
	<div id="articles" class="container">
		<?php
		
		require_once("cms/Article.php");
		require_once("cms/FileReader.php");

		$fileReader = new FileReader();
		$files = $fileReader->GetFilenames('articles/');
		foreach($files as $file)
		{
			$article = new Article("articles/$file", $fileReader);
			echo '<article id="article-'.$file.'">';
			echo $article->GetContents();
			echo '</article>';
		}
		
		?>
	</div>
	<footer id="site-footer">
		<p>&copy; copyright 2014 teknine.com</p>
	</footer>
</body>
</html>