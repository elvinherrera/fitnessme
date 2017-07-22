class ProfilesController < ApplicationController
  def index
  end

  def show
  end

  def new
  end

  def create
  end

  def destroy
  end

  def update
  end

  def edit
  end

  def faction_page
    @profiles = Profile.find_by(group_id: params[:group_id]
      )
  end
end
