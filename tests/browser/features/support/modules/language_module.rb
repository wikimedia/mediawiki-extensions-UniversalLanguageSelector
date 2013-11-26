module LanguageModule
	include PageObject

	def language_to_code(language)
		case language
			when "German"
				"de"
			when "English"
				"en"
			when "Finnish"
				"fi"
			when "Hebrew"
				"he"
			when "Hindi"
				"hi"
			else
				pending
		end
	end
end
