class TutorialsController < ApplicationController
  before_action :authenticate_user!
  def index
    @tutorials = Tutorial.all
  end

  def profile_tutorial
    @tutorials = Tutorial.all.where(id: params[:id])
  end

  def new
    @tutorial = Tutorial.new
  end

  def create
    @tutorial = Tutorial.new(
      title: params[:title],
      description: params[:description],
      tutorial_type: params[:tutorial_type],
      weights: params[:weights],
      experience: params[:experience],
      equipment: params[:equipment],
      profile_id: params[:profile_id],
      video_id: params[:video_id],
      post_id: params[:post_id]
    )
     if @tutorial.save
      flash[:success] = "Tutorial Created"
      redirect_to "/tutorials/#{@tutorial.id}"
    else
      render 'new.html.erb'
    end
  end

  def show
    if params[:id] == 'random'
      @tutorial = Tutorial.all.sample
    else
      @tutorial = Tutorial.find_by(id: params[:id])
    end
    @videos = Video.all
  end

  def edit
    @tutorial = Tutorial.find_by(id: params[:id])
    render 'edit.html.erb'
  end

  def update
    @tutorial = Tutorial.find_by(id: params[:id])
    @tutorial.assign_attributes( 
      title: params[:title],
      description: params[:description],
      tutorial_type: params[:tutorial_type],
      weights: params[:weights],
      experience: params[:experience],
      equipment: params[:equipment],
      profile_id: params[:profile_id],
      video_id: params[:video_id],
      post_id: params[:post_id]
      )
    if @tutorial.save
      flash[:success] = "Tutorial updated"
      redirect_to tutorials_path 
    else
      flash[:warning] = @tutorial.errors.full_messages.join(", ")
      render :edit
    end
  end

  def destroy
    @tutorial = Tutorial.find_by(id: params[:id])
    @Tutorial.destroy

    flash[:warning] = "Tutorial has been deleted"
    redirect_to "/"
  end
end
