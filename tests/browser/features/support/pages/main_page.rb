class MainPage
	include PageObject

	include URL
	page_url URL.url('Main_Page')

	def non_interlanguage_links_use_autonym_font?
		@browser.elements(css: '#p-lang li:not(.interlanguage-link)').collect do |element|
			element.style("font-family")
		end.to_s.match(/Autonym/) != nil
	end
end
