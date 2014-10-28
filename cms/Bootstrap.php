<?php

//ini_set('display_errors',1);
//ini_set('display_startup_errors',1);
//error_reporting(-1);

class Bootstrap
{
	private $_app = null;

	function __construct(Application $app)
	{
		if ($app == null)
		{
			throw new Exception('Missing required parameter "$app"');
		}
		$this->_app = $app;
	}

	public function Run()
	{
		$cr = new ConfigurationReader();
		$config = $cr->Parse();
		$this->_app->SetConfig($config);
	}

}

?>