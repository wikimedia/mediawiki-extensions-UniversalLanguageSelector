# encoding: utf-8

class RandomPage
  include PageObject

  include URL
  page_url URL.url('Special:Random')

  span(:cog, title: 'Language settings')
  a(:create_a_book, text: 'Create a book')
  a(:download_as_pdf, text: 'Download as PDF')
  a(:download_the_file, text: 'Download the file')
  li(:main_page, id: 'n-mainpage-description')
  a(:malayalam_link, title: 'Malayalam')
  a(:print_export, text: 'Print/export')
  a(:printable_version, text: 'Printable version')
  button(:search_button, id: 'searchButton')
end
