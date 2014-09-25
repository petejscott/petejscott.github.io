<?php

class Article
{
	private $_backingFile;
	private $_fileReader;

	private $_id;
	private $_contents = null;

	public function GetId()
	{
		return $this->_id;
	}
	public function SetId($id)
	{
		$this->_id = $id;
	}

	public function GetContents()
	{
		if ($this->_contents == null)
		{
			$contents = $this->
				_fileReader->
				Fetch($this->_backingFile);
			$this->_contents = $contents;
		}
		return $this->_contents;
	}
	public function SetContents($contents)
	{
		$this->_contents = $contents;
	}

	function __construct($backingFile, FileReader $fileReader)
	{
		if ($backingFile == null)
		{
			throw new Exception('$backingFile is required');
		}
		if ($fileReader == null)
		{
			throw new Exception('$fileReader is required');
		}
		$this->_backingFile = $backingFile;
		$this->_fileReader = $fileReader;
	}
}

?>