class AsciiMono
  include PageObject

  include URL
  def self.url
    URL.url('ASCII?useskin=monobook')
  end
  page_url url
end
