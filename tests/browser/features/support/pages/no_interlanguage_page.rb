class NoInterlanguagePage
  include PageObject

  include URL
  def self.url
    URL.url('Think_Like_a_Cat')
  end
  page_url url

  include InterlanguagePageModule
end
