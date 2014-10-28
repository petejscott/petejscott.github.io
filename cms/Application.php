<?php

require_once("Article.php");
require_once("FileReader.php");
require_once("ConfigurationReader.php");

class Application
{

	private $_config = Array();

	private function GetConfig()
	{
		return $this->_config;
	}
	public function SetConfig($config)
	{
		$this->_config = $config;
	}

	public function GetArticleDirectory()
	{
		$dir = $this->_config['article_directory'];
		if (substr($dir, -strlen('/')) !== '/')
		{
			$dir.='/';
		}
		return $dir;
	}

}

?>