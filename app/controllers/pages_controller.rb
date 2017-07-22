class PagesController < ApplicationController
  def home
    render "home.html.erb"
  end

  def guest
    render "guest_homepage.html.erb"
  end
end
