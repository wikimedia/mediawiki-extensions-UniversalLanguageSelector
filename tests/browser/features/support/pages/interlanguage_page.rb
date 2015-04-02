class InterlanguagePage
  include PageObject
  include InterlanguagePageModule

  include URL
  def self.url
    URL.url("Boleyn_family")
  end
  page_url url
end
