class MainPage
  include PageObject

  page_url 'Main_Page'

  span(:cog, title: 'Language settings')
  a(:create_a_book, text: 'Create a book')
  a(:download_as_pdf, text: 'Download as PDF')
  a(:download_the_file, text: 'Download the file')
  li(:main_page, id: 'n-mainpage-description')
  div(:asia, id: 'AS')
  a(:malayalam) do |page|
    page.asia_element.element.li(lang: 'ml')
  end
  a(:print_export, text: 'Print/export')
  a(:printable_version, text: 'Printable version')
  button(:search_button, id: 'searchButton')

  def non_interlanguage_links_use_autonym_font?
    browser.elements(css: '#p-lang li:not(.interlanguage-link)').collect do |element|
      element.style('font-family')
    end.to_s.match(/Autonym/) != nil
  end
end
