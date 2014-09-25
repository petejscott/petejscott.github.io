<?php

class FileReader
{
	public function Fetch($pathToFile)
	{
		$fileContents = file_get_contents($pathToFile);
		return $fileContents;
	}

	public function GetFilenames($path)
	{
		$files = scandir($path, SCANDIR_SORT_DESCENDING);
		return array_filter(
			$files,
			array($this, 'filterFilenames'));
	}

	public function filterFilenames($item)
	{
		if ($item == "." || $item == "..")
		{
			return false;
		}
		return true;
	}
}

?>