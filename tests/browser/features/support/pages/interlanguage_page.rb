class InterlanguagePage
  include PageObject

  include URL
  def self.url
    URL.url('Boleyn_family')
  end
  page_url url

  include InterlanguagePageModule
end
