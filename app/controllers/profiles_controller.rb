class ProfilesController < ApplicationController
  before_action :authenticate_user!, except: :homed
  def home
    @profiles = Profile.all 

  end

  def show
  profile = Profile.where(id: current_user.profile.id)
  end

  def new
    @profile = Profile.new
  end

  def create
      @profile = Profile.new(
      first_name: params[:first_name],
      description: params[:description],
      last_name: params[:last_name],
      date_of_birth: params[:date_of_birth],
      screen_name: params[:screen_name],
      email: params[:email],
      location: params[:location],
      url: params[:url],
      user_id: params[:user_id],
      followers_count: params[:followers_count],
      friends_count: params[:friends_count],
      statuses_count: params[:statuses_count],
      tutorial_count: params[:tutorial_count],
      image_id: params[:image_id])
    @profile.save
      if @profile.save
      flash[:success] = "Profile Created"
      redirect_to "/profiles/#{@profile.id}"
    else
      render 'new.html.erb'
    end
  end


  def destroy
    if current_user && current_user.admin 
      @profile = Profile.find_by(id: params[current_user.id])
    @profile.destroy
    flash[:warning] = "Profile has been deleted"
    redirect_to "/tutorials"
  else
    flash[:warning] = "Profile has been left alone, please verify identity"
    redirect_to "/sign_in"
  end
  end

  def update
  end

  def edit
  end

  def faction
    @profiles = Profile.find_by(group_id: params[:group_id]
      )
  end
end
