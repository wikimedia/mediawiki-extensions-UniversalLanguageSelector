ifndef MW_INSTALL_PATH
	MW_INSTALL_PATH=../../../..
endif

default:
	${MW_INSTALL_PATH}/vendor/bin/phpunit.php .

.PHONY: *Test.php
*Test.php:
	${MW_INSTALL_PATH}/vendor/bin/phpunit $@
