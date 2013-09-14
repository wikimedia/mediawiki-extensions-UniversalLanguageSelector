class AsciiVector
  include PageObject

  include URL
  def self.url
    URL.url('ASCII?useskin=vector')
  end
  page_url url
end
