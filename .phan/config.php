<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

$cfg['directory_list'] = array_merge(
	$cfg['directory_list'],
	[
		'data',
		'../../extensions/BetaFeatures',
		'../../extensions/Babel',
		'../../extensions/MobileFrontend',
		'../../extensions/cldr',
	]
);

$cfg['exclude_analysis_directory_list'] = array_merge(
	$cfg['exclude_analysis_directory_list'],
	[
		'../../extensions/BetaFeatures',
		'../../extensions/Babel',
		'../../extensions/MobileFrontend',
		'../../extensions/cldr',
	]
);

// TODO: Remove after MLEB 2026.01 remove
$cfg['exclude_file_list'] = array_merge(
	$cfg['exclude_file_list'],
	[
		'data/LanguageNameIndexer.php',
		'data/LanguageNameSearch.php',
		'data/LanguageNameSearchData.php',
	]
);

return $cfg;
