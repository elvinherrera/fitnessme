class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :google_maps

  def after_sign_in_path_for(resource)
    pages_home_path if resource.is_a?(User) 
  end

  def authenticate_admin!
    redirect_to '/tutorials' unless current_user && current_user.admin
  end

  def all_tags
    Tag.all
  end
  helper_method :all_tags

  def google_maps
    @googleusers = User.all
    @hash = Gmaps4rails.build_markers(@googleusers) do |user, marker|
      marker.lat user.latitude
      marker.lng user.longitude
    end
  end
end
