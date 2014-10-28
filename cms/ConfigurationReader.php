<?php

class ConfigurationReader
{
	private $_configFile = 'config.php';

	public function Parse()
	{
		include $this->_configFile;
		return $configuration;
	}
}

?>