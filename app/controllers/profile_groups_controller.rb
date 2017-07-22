class ProfileGroupsController < ApplicationController
  before_action :authenticate_user!, except: :info

  def index
    if current_user.profile.profile_groups.where(status: 'joined').count == 0

      redirect_to "/tutorials"
    else
    @profile_groups = current_user.profile.profile_groups.where(status: 'joined')
    render 'index.html.erb'
    end
  end

  def show
    if params[:id] == 'random'
      @profile_group = ProfileGroup.all.sample
    else
      @profile_group = ProfileGroup.find_by(id: params[:id])
    end
  end

  def create
    @profile_group = ProfileGroup.new(
      profile_id: current_user.profile.id,
      group_id: params[:group_id],
      status: 'joined'
      )
    @profile_group.save
    redirect_to "/profile_groups"
  end

  def destroy
    profile_group = ProfileGroup.find_by(id: params[:id])
    profile_group.update(status: 'removed')
    redirect_to '/profile_groups'
  end
end
